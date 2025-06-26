"use server";

import { eq } from "sqlkit";
import { handleActionException } from "./RepositoryException";
import { persistenceRepository } from "../persistence/persistence-repositories";

/**
 * Sets a key-value pair in the KV store.
 * If key exists, updates the value. If not, creates a new entry.
 *
 * @param key - The key to set
 * @param value - The value to store (can be string, object, etc.)
 * @returns Promise<boolean> - Success status
 */
export async function set(
  key: string,
  value: string | { [key: string]: any }
): Promise<boolean> {
  try {
    // For jsonb field, we need to wrap plain text in an object
    const jsonValue = typeof value === "string" ? { data: value } : value;

    // Check if key already exists
    const [existingKV] = await persistenceRepository.kv.find({
      where: eq("key", key),
      limit: 1,
    });

    if (existingKV) {
      // Update existing record
      await persistenceRepository.kv.update({
        where: eq("key", key),
        data: { value: jsonValue },
      });
    } else {
      // Insert new record
      await persistenceRepository.kv.insert([
        {
          key,
          value: jsonValue,
        },
      ]);
    }

    return true;
  } catch (error) {
    handleActionException(error);
    return false;
  }
}

/**
 * Gets a value from the KV store by key.
 *
 * @param key - The key to retrieve
 * @returns Promise<any | null> - The value if found, null otherwise
 */
export async function get(key: string): Promise<any | null> {
  try {
    const [kv] = await persistenceRepository.kv.find({
      where: eq("key", key),
      columns: ["value"],
      limit: 1,
    });

    if (!kv?.value) return null;

    // If it's a wrapped string value, unwrap it
    if (
      typeof kv.value === "object" &&
      kv.value !== null &&
      "data" in kv.value &&
      Object.keys(kv.value).length === 1
    ) {
      return kv.value.data;
    }

    // Otherwise return the object as-is
    return kv.value;
  } catch (error) {
    return null;
  }
}

/**
 * Deletes a key-value pair from the KV store.
 *
 * @param key - The key to delete
 * @returns Promise<boolean> - Success status
 */
export async function del(key: string): Promise<boolean> {
  try {
    await persistenceRepository.kv.delete({
      where: eq("key", key),
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Checks if a key exists in the KV store.
 *
 * @param key - The key to check
 * @returns Promise<boolean> - True if key exists, false otherwise
 */
export async function exists(key: string): Promise<boolean> {
  try {
    const [kv] = await persistenceRepository.kv.find({
      where: eq("key", key),
      columns: ["id"],
      limit: 1,
    });

    return !!kv;
  } catch (error) {
    return false;
  }
}

/**
 * Gets all keys from the KV store.
 *
 * @returns Promise<string[]> - Array of all keys
 */
export async function keys() {
  try {
    const kvs = await persistenceRepository.kv.find({
      columns: ["key"],
    });

    return {
      success: true as const,
      data: kvs.map((kv) => kv.key),
    };
  } catch (error) {
    return handleActionException(error);
  }
}
