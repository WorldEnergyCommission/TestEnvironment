import { EventType } from "@/store/modules/events/types";

/**
 * Convert type id to human readable form
 * @param type typecode
 * @returns Humanreadable type
 */
export function typeFromNumberCode(type: EventType) {
  switch (type) {
    case EventType.Warning:
      return "Warning";
    case EventType.Error:
      return "Error";
    default:
      return "Info";
  }
}
