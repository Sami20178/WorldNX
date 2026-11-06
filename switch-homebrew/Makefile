ifeq ($(strip $(DEVKITPRO)),)
$(error "Please set DEVKITPRO in your environment. export DEVKITPRO=/opt/devkitpro")
endif

# Load the official Switch build rules before setting project-specific variables.
include $(DEVKITPRO)/libnx/switch_rules

TOPDIR ?= $(CURDIR)
TARGET := WorldNX
BUILD := build
SOURCES := source
DATA :=
INCLUDES :=

ARCH := -march=armv8-a -mtune=cortex-a57 -mtp=soft -fPIE
CC := $(DEVKITPRO)/devkitA64/bin/aarch64-none-elf-gcc
CXX := $(DEVKITPRO)/devkitA64/bin/aarch64-none-elf-g++
LD := $(CC)
CFLAGS := -g -Wall -O2 -ffunction-sections -fdata-sections $(ARCH)
CFLAGS += $(INCLUDE) -D__SWITCH__
CXXFLAGS := $(CFLAGS) -fno-rtti -fno-exceptions
ASFLAGS := $(ARCH)

# switch_rules links with LIBPATHS; set it explicitly to the installed libnx.
LIBPATHS := -L$(DEVKITPRO)/libnx/lib
LDFLAGS := -specs=$(DEVKITPRO)/libnx/switch.specs $(ARCH) -Wl,-Map,$(notdir $*.map)
LIBS := -lnx

.PHONY: all clean
all: $(BUILD)/$(TARGET).nro

clean:
	rm -rf $(BUILD)
