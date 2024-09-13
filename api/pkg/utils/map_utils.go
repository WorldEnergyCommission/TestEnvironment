package utils

// GetValueWithDefault handles value retrieval by key with a default value
func GetValueWithDefault[K comparable, V any](inputMap map[K]V, key K, defaultValue V) V {
	value, ok := inputMap[key]
	if ok {
		return value
	} else {
		return defaultValue
	}
}

// Return keys of the given map
func StringKeys(m map[string]float64) (keys []string) {
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}

// Return  the first key of an map[int64]float64
// if map is emplty return def key
func GetFirstIntKey(m map[int64]float64, def int64) int64 {
	for k := range m {
		return k
	}
	return def
}

// Return  the smalles key (that is smaller than def) of an map[int64]float64,
// if map is empty return def
func GetSmallesIntKey(m map[int64]float64, def int64) int64 {
	key := def
	for k := range m {
		if k < key {
			key = k
		}
	}
	return key
}

// Return  the smalles key (that is smaller than def) of an map[int64]float64,
// if map is empty return def
func GetBiggestIntKey(m map[int64]float64, def int64) int64 {
	key := def
	for k := range m {
		if k > key {
			key = k
		}
	}
	return key
}

func Int64Keys(m map[int64]float64) (keys []int64) {
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}
