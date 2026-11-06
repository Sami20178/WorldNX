.SUFFIXES:

ifeq ($(strip $(DEVKITPRO)),)
$(error "Please set DEVKITPRO in your environment. export DEVKITPRO=/opt/devkitpro")
endif

include $(DEVKITPRO)/libnx/switch_rules

TARGET := WorldNX
BUILD := build
SOURCES := source
DATA :=
INCLUDES :=

CFLAGS := -g -Wall -O2 -ffunction-sections -fdata-sections
CFLAGS += $(INCLUDE) -D__SWITCH__
CXXFLAGS := $(CFLAGS) -fno-rtti -fno-exceptions
LDFLAGS := -specs=$(DEVKITPRO)/libnx/switch.specs -Wl,-Map,$(notdir $*.map)
LIBS := -lnx

.PHONY: all clean
all: $(BUILD)/$(TARGET).nro

$(BUILD)/$(TARGET).nro: $(SOURCES)/*.c
	@mkdir -p $(BUILD)
	$(CC) $(CFLAGS) $(INCLUDES) $< -o $(BUILD)/$(TARGET).elf $(LDFLAGS) $(LIBS)
	$(NX_ELF2NRO) $(BUILD)/$(TARGET).elf $@ --icon=$(CURDIR)/icon.jpg -- romfsdir=$(CURDIR)/romfs

clean:
	rm -rf $(BUILD)
