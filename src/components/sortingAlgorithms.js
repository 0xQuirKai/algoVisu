// bubbleSort.js
export function* bubbleSort(arr) {
    let array = [...arr];
    let n = array.length;
    let done = [];

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            // Yield the current state for visualization (indices being compared)
            yield { array: [...array], comparing: [j, j + 1], done: [...done] };

            if (array[j] > array[j + 1]) {
                // Swap
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                yield { array: [...array], swapping: [j, j + 1], done: [...done] };
            }
        }
        // Mark the last element as sorted
        done.push(n - i - 1);
    }
    done.push(0); // Mark the first element as sorted
    yield { array: [...array], comparing: [], swapping: [], done: [...done] };
}


export function* insertionSort(arr) {
    let array = [...arr];
    let done = [];

    for (let i = 1; i < array.length; i++) {
        let key = array[i];
        let j = i;

        while (j > 0 && array[j - 1] > key) {
            // Compare the current position with the previous element
            yield { array: [...array], comparing: [j - 1, j], swapping: [], done: [...done] };

            // Shift the larger element forward
            array[j] = array[j - 1];
            yield { array: [...array], comparing: [], swapping: [j - 1, j], done: [...done] };

            j--;
        }

        // Place the key in its final position
        array[j] = key;
        if (j !== i) {
            yield { array: [...array], comparing: [], swapping: [j, i], done: [...done] };
        }

        // Mark the current position as sorted
        yield { array: [...array], comparing: [], swapping: [], done: [...done] };
    }

    // Ensure all elements are marked as done
    for (let k = 0; k < array.length; k++) {
        if (!done.includes(k)) done.push(k);
    }
    yield { array: [...array], comparing: [], swapping: [], done: [...done] };
}