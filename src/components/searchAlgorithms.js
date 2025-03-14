export function* linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        yield { array: [...arr], searching: [i], found: arr[i] === target ? i : null };
        if (arr[i] === target) return;
    }
    yield { array: [...arr], searching: [], found: -1 }; // Target not found
}

export function* binarySearch(arr, target) {
    let left = 0,
        right = arr.length - 1;
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        yield { array: [...arr], searching: [mid], found: arr[mid] === target ? mid : null };
        if (arr[mid] === target) return;
        arr[mid] < target ? (left = mid + 1) : (right = mid - 1);
    }
    yield { array: [...arr], searching: [], found: -1 }; // Target not found
}