#pragma once

// Deliberately not a general-purpose JSON library: NeoBladeETS2 only ever
// emits one fixed shape (TelemetrySnapshot) and reads back a tiny, flat
// control-message shape, so a hand-rolled writer + a few string finds
// avoids pulling in and vetting the license of a third-party JSON dep for a
// handful of fields. Keep src/integrations/ets2/types.ts's field names in
// sync with this by hand.

#include <sstream>
#include <string>

namespace neoblade::ipc {

class JsonWriter {
 public:
  JsonWriter() { stream_ << '{'; }

  JsonWriter& Field(const char* name, double value) {
    Comma();
    stream_ << '"' << name << "\":" << value;
    return *this;
  }
  JsonWriter& Field(const char* name, int64_t value) {
    Comma();
    stream_ << '"' << name << "\":" << value;
    return *this;
  }
  JsonWriter& Field(const char* name, uint32_t value) {
    Comma();
    stream_ << '"' << name << "\":" << value;
    return *this;
  }
  JsonWriter& Field(const char* name, bool value) {
    Comma();
    stream_ << '"' << name << "\":" << (value ? "true" : "false");
    return *this;
  }
  JsonWriter& Field(const char* name, const char* value) {
    Comma();
    stream_ << '"' << name << "\":\"" << Escape(value) << '"';
    return *this;
  }

  // For nested objects: pass the already-built inner JsonWriter's Finish()
  // result as a raw (pre-escaped) value.
  JsonWriter& RawField(const char* name, const std::string& rawJson) {
    Comma();
    stream_ << '"' << name << "\":" << rawJson;
    return *this;
  }

  std::string Finish() {
    stream_ << '}';
    return stream_.str();
  }

 private:
  void Comma() {
    if (!first_) stream_ << ',';
    first_ = false;
  }

  static std::string Escape(const char* value) {
    std::string out;
    for (const char* p = value; *p; ++p) {
      if (*p == '"' || *p == '\\') out.push_back('\\');
      out.push_back(*p);
    }
    return out;
  }

  std::ostringstream stream_;
  bool first_ = true;
};

}  // namespace neoblade::ipc
