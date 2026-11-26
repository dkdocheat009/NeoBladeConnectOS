#pragma once

// Bumped whenever the IPC protocol (control_pipe.hpp / frame_shared_memory.hpp)
// changes shape, so the host and the plugin can refuse to talk to an
// incompatible partner instead of silently misreading bytes.
#define NEOBLADE_ETS2_PROTOCOL_VERSION 1

#define NEOBLADE_ETS2_PLUGIN_VERSION "0.1.0-fase10"
