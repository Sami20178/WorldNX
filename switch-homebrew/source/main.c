#include <switch.h>
#include <stdio.h>

int main(int argc, char* argv[]) {
    consoleInit(NULL);

    printf("\x1b[1;34mWorldNX Homebrew\x1b[0m\n");
    printf("==============================\n\n");
    printf("Nintendo Switch Homebrew-Diagnose\n\n");
    printf("Firmware: %u.%u.%u\n",
        hosversionGet() & 0xFF,
        (hosversionGet() >> 8) & 0xFF,
        (hosversionGet() >> 16) & 0xFF);
    printf("\nDieses Programm liest nur Systeminformationen\n");
    printf("und Controller-Eingaben. Es aendert keine\n");
    printf("Systemdateien und umgeht keine Schutzmechanismen.\n\n");
    printf("Druecke A, um den Eingabetest auszufuehren.\n");
    printf("Druecke B, um das Programm zu beenden.\n\n");

    bool inputTestDone = false;
    while (appletMainLoop()) {
        hidScanInput();
        u64 kDown = hidKeysDown(CONTROLLER_P1_AUTO);

        if ((kDown & KEY_A) && !inputTestDone) {
            printf("\nController-Test: A-Taste erkannt.\n");
            inputTestDone = true;
        }
        if (kDown & KEY_B) break;
        consoleUpdate(NULL);
    }

    consoleExit(NULL);
    return 0;
}
