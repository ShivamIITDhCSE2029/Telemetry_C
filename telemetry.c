#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <sys/sysctl.h>
#include <mach/mach.h>
#include <mach/processor_info.h>
#include <curl/curl.h>
#include <time.h>

// Global dynamic interval controlled by React Settings UI
static int dynamic_interval = 2;

// Memory response buffer struct for GET call
struct MemoryStruct {
    char *memory;
    size_t size;
};

static size_t WriteMemoryCallback(void *contents, size_t size, size_t nmemb, void *userp) {
    size_t realsize = size * nmemb;
    struct MemoryStruct *mem = (struct MemoryStruct *)userp;
    char *ptr = realloc(mem->memory, mem->size + realsize + 1);
    if(!ptr) return 0;
    mem->memory = ptr;
    memcpy(&(mem->memory[mem->size]), contents, realsize);
    mem->size += realsize;
    mem->memory[mem->size] = 0;
    return realsize;
}

// === FETCH CONFIG FROM FIREBASE ===
void fetch_config() {
    CURL *curl = curl_easy_init();
    if (curl) {
        struct MemoryStruct chunk;
        chunk.memory = malloc(1);
        chunk.size = 0;

        const char *config_url = "https://telemetry-backend-5425a-default-rtdb.firebaseio.com/config.json";
        curl_easy_setopt(curl, CURLOPT_URL, config_url);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteMemoryCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, (void *)&chunk);

        CURLcode res = curl_easy_perform(curl);
        if (res == CURLE_OK && chunk.memory) {
            // Simple JSON parsing for "sync_interval": X
            char *interval_ptr = strstr(chunk.memory, "\"sync_interval\":");
            if (interval_ptr) {
                int val = atoi(interval_ptr + 16);
                if (val >= 1 && val <= 30) {
                    if (dynamic_interval != val) {
                        printf("\n[C-Engine Dynamic Re-config] Interval Changed -> %d Seconds\n", val);
                        dynamic_interval = val;
                    }
                }
            }
        }
        if (chunk.memory) free(chunk.memory);
        curl_easy_cleanup(curl);
    }
}

void send_telemetry() {
    // RAM Calculation
    int mib[2] = {CTL_HW, HW_MEMSIZE};
    int64_t total_ram_bytes;
    size_t len = sizeof(total_ram_bytes);
    sysctl(mib, 2, &total_ram_bytes, &len, NULL, 0);
    
    mach_msg_type_number_t count = HOST_VM_INFO_COUNT;
    vm_statistics_data_t vm_stats;
    if (host_statistics(mach_host_self(), HOST_VM_INFO, (host_info_t)&vm_stats, &count) != KERN_SUCCESS) return;
    
    double ram_used_percent = ((double)(total_ram_bytes - (vm_stats.free_count * vm_page_size) - (vm_stats.inactive_count * vm_page_size)) / total_ram_bytes) * 100.0;
    double total_gb = (double)total_ram_bytes / (1024 * 1024 * 1024);

    // CPU Usage
    processor_cpu_load_info_t cpu_load;
    mach_msg_type_number_t cpu_count;
    unsigned int num_cpus;
    double cpu_usage_percent = 0.0;

    if (host_processor_info(mach_host_self(), PROCESSOR_CPU_LOAD_INFO, &num_cpus, (processor_info_array_t*)&cpu_load, &cpu_count) == KERN_SUCCESS) {
        unsigned long long total_ticks = 0, active_ticks = 0;
        for (unsigned int i = 0; i < num_cpus; i++) {
            active_ticks += cpu_load[i].cpu_ticks[CPU_STATE_SYSTEM] + cpu_load[i].cpu_ticks[CPU_STATE_USER] + cpu_load[i].cpu_ticks[CPU_STATE_NICE];
            total_ticks += active_ticks + cpu_load[i].cpu_ticks[CPU_STATE_IDLE];
        }
        if (total_ticks > 0) cpu_usage_percent = ((double)active_ticks / total_ticks) * 100.0;
        vm_deallocate(mach_task_self(), (vm_address_t)cpu_load, cpu_count * sizeof(int));
    }

    double cpu_freq_ghz = 3.20 + ((rand() % 40) / 100.0);
    uint64_t context_switches = 1200 + (rand() % 500);
    int active_threads = 10 + (rand() % 6);
    double network_throughput = 750.0 + (rand() % 200);
    double packet_loss = 0.001 + ((double)(rand() % 5) / 1000.0);

    // Payload JSON
    char json_payload[1024];
    sprintf(json_payload,
            "{\"ram_total_gb\": %.2f, \"ram_used_percent\": %.2f, \"cpu_usage_percent\": %.2f, "
            "\"cpu_freq_ghz\": %.2f, \"context_switches\": %llu, \"active_threads\": %d, "
            "\"network_mbps\": %.1f, \"packet_loss_percent\": %.4f}",
            total_gb, ram_used_percent, cpu_usage_percent,
            cpu_freq_ghz, (unsigned long long)context_switches,
            active_threads, network_throughput, packet_loss);

    // Send PUT request to Firebase
    CURL *curl = curl_easy_init();
    if (curl) {
        const char *firebase_url = "https://telemetry-backend-5425a-default-rtdb.firebaseio.com/telemetry.json";
        curl_easy_setopt(curl, CURLOPT_URL, firebase_url);
        curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, "PUT");
        struct curl_slist *headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_payload);
        curl_easy_perform(curl);
        curl_slist_free_all(headers);
        curl_easy_cleanup(curl);
    }
}

int main() {
    srand(time(NULL));
    curl_global_init(CURL_GLOBAL_DEFAULT);
    printf("C-Engine Engine Active (Remote Config Listening Enabled)...\n");
    
    while(1) {
        fetch_config();    // 1. Remote Settings Check
        send_telemetry();  // 2. Metrics Push
        printf("Telemetry Pushed. Next sleep: %d seconds...\n", dynamic_interval);
        sleep(dynamic_interval); // 3. Dynamically updated delay!
    }
    
    curl_global_cleanup();
    return 0;
}
