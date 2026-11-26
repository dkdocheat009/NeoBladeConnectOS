cmake_minimum_required(VERSION 3.21)
project(NeoBladeETS2 LANGUAGES CXX)

if(NOT WIN32)
  message(FATAL_ERROR "NeoBladeETS2 only builds for Windows (ETS2 bin/win_x64/plugins).")
endif()

if(NOT CMAKE_SIZEOF_VOID_P EQUAL 8)
  message(FATAL_ERROR "NeoBladeETS2 must be built x64 (ETS2 1.61+ is 64-bit only). "
                       "Re-run CMake with -A x64 (Visual Studio generator) or the x64 "
                       "Native Tools prompt (Ninja/NMake generators).")
endif()

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_WINDOWS_EXPORT_ALL_SYMBOLS OFF)

include(FetchContent)

# ---------------------------------------------------------------------------
# SCS Telemetry SDK headers.
#
# SCS Software publishes this SDK for third-party plugin authors (it ships
# with its own sdk_license.txt, separate from this project's MIT license).
# Rather than retype these headers from memory (risk of subtle transcription
# errors, and a dubious way to reproduce someone else's licensed material),
# CMake fetches the exact, unmodified files from truckermudgeon/scs-sdk-plugin
# (MIT-licensed wrapper repo; see docs/ETS2_ARCHITECTURE.md) at configure
# time, pinned to one commit for reproducible builds.
# ---------------------------------------------------------------------------
FetchContent_Declare(
  scs_sdk_plugin
  GIT_REPOSITORY https://github.com/truckermudgeon/scs-sdk-plugin.git
  # "master" as inspected for Fase 10 (HEAD was c8910d6 at the time this was
  # written). Pin this to a full 40-char commit SHA once you have verified
  # one against your own clone, for a fully reproducible build; left as a
  # branch name here rather than guessing the rest of a hash we only saw
  # abbreviated.
  GIT_TAG        master
  GIT_SHALLOW    TRUE
)
FetchContent_GetProperties(scs_sdk_plugin)
if(NOT scs_sdk_plugin_POPULATED)
  FetchContent_Populate(scs_sdk_plugin)
endif()
set(SCS_SDK_INCLUDE_DIR "${scs_sdk_plugin_SOURCE_DIR}/scs_sdk/include")

# ---------------------------------------------------------------------------
# MinHook — x86/x64 inline hooking library (MIT). Used for the DX11 Present /
# CreateTexture2D hooks (render/d3d11_hook.cpp) — never for patching the
# game's own gameplay/physics code.
# ---------------------------------------------------------------------------
FetchContent_Declare(
  minhook
  GIT_REPOSITORY https://github.com/TsudaKageyu/minhook.git
  GIT_TAG        v1.3.4
  GIT_SHALLOW    TRUE
)
FetchContent_MakeAvailable(minhook)

add_library(NeoBladeETS2 SHARED
  src/dllmain.cpp
  src/logging.cpp
  src/telemetry.cpp
  src/ipc/control_pipe.cpp
  src/ipc/frame_shared_memory.cpp
  src/render/pattern_scan.cpp
  src/render/d3d11_hook.cpp
  src/render/diagnostic_frame.cpp
  src/input/hotkey_hook.cpp
)

target_include_directories(NeoBladeETS2 PRIVATE
  src
  "${SCS_SDK_INCLUDE_DIR}"
)

target_compile_definitions(NeoBladeETS2 PRIVATE
  UNICODE
  _UNICODE
  WIN32_LEAN_AND_MEAN
  NOMINMAX
)

target_link_libraries(NeoBladeETS2 PRIVATE
  # FetchContent_MakeAvailable adds minhook's own CMakeLists.txt as a
  # subdirectory, which defines a plain `minhook` target (the `minhook::`
  # namespaced alias only exists for an *installed* package consumed via
  # find_package, not for an in-build FetchContent target).
  minhook
  d3d11
  dxgi
  user32
  advapi32
  gdi32
  psapi
)

set_target_properties(NeoBladeETS2 PROPERTIES
  OUTPUT_NAME "NeoBladeConnectOS_ETS2"
  RUNTIME_OUTPUT_DIRECTORY_RELEASE "${CMAKE_BINARY_DIR}/bin/Release"
  LIBRARY_OUTPUT_DIRECTORY_RELEASE "${CMAKE_BINARY_DIR}/bin/Release"
)

# ETS2 loads plugins purely by their .def-exported C functions (scs_telemetry_init /
# scs_telemetry_shutdown) — a .def file keeps the exported names un-mangled and
# documents the plugin ABI surface in one place instead of scattering
# __declspec(dllexport) across files.
target_sources(NeoBladeETS2 PRIVATE src/NeoBladeETS2.def)
