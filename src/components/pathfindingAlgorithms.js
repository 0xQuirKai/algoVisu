export function* dijkstra(grid, start, end) {
        const rows = grid.length;
        const cols = grid[0].length;
        const distances = new Array(rows * cols).fill(Infinity);
        const previous = new Array(rows * cols).fill(null); // Store predecessors
        const queue = [];
        const startIdx = start.row * cols + start.col;
        const endIdx = end.row * cols + end.col;

        distances[startIdx] = 0;
        queue.push({ row: start.row, col: start.col, dist: 0 });

        while (queue.length > 0) {
            queue.sort((a, b) => a.dist - b.dist); // Simple sort for min distance
            const { row, col } = queue.shift(); // Dequeue closest node
            const currIdx = row * cols + col;

            if (currIdx === endIdx) {
                console.log("Found path!");
                // Build path
                const path = [];
                let idx = endIdx;
                while (idx !== null) {
                    const r = Math.floor(idx / cols);
                    const c = idx % cols;
                    path.push({ row: r, col: c });
                    idx = previous[idx];
                }
                yield { searching: [], path: path.reverse() };
                return;
            }

            const neighbors = [
                { r: row - 1, c: col },
                { r: row + 1, c: col },
                { r: row, c: col - 1 },
                { r: row, c: col + 1 }
            ].filter(n => n.r >= 0 && n.r < rows && n.c >= 0 && n.c < cols && grid[n.r][n.c] !== 1);

            const searching = [];
            for (const { r, c }
                of neighbors) {
                const nextIdx = r * cols + c;
                const newDist = distances[currIdx] + 1;
                if (newDist < distances[nextIdx]) {
                    distances[nextIdx] = newDist;
                    previous[nextIdx] = currIdx; // Update predecessor
                    searching.push({ row: r, col: c });
                    queue.push({ row: r, col: c, dist: newDist });
                }
            }

            yield { searching, path: [] };
        }
    }
    // Placeholder for aStar (assuming it’s similar but with heuristic)
export function* aStar(grid, start, end) {
    const rows = grid.length;
    const cols = grid[0].length;

    const openSet = [{ row: start.row, col: start.col, g: 0, f: 0, parent: null }];
    const closedSet = new Set();

    const getNeighbors = (node) => {
        const { row, col } = node;
        return [
            { row: row - 1, col },
            { row: row + 1, col },
            { row, col: col - 1 },
            { row, col: col + 1 },
        ].filter(
            (n) =>
            n.row >= 0 &&
            n.row < rows &&
            n.col >= 0 &&
            n.col < cols &&
            grid[n.row][n.col] !== 1 // 1 represents a wall/block
        );
    };

    const heuristic = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col); // Manhattan distance

    while (openSet.length) {
        openSet.sort((a, b) => a.f - b.f); // Sort by f-score
        const current = openSet.shift(); // Take node with lowest f-score

        if (current.row === end.row && current.col === end.col) {
            let path = [];
            let temp = current;
            while (temp) {
                path.push({ row: temp.row, col: temp.col });
                temp = temp.parent;
            }
            yield { searching: [], open: [], path: path.reverse() }; // Final path
            return;
        }

        closedSet.add(`${current.row},${current.col}`);

        const neighbors = getNeighbors(current);
        for (const neighbor of neighbors) {
            const key = `${neighbor.row},${neighbor.col}`;
            if (closedSet.has(key)) continue;

            const g = current.g + 1; // Uniform cost (1 per step)
            const h = heuristic(neighbor, end);
            const f = g + h;

            const existingNode = openSet.find((n) => n.row === neighbor.row && n.col === neighbor.col);
            if (!existingNode) {
                openSet.push({...neighbor, g, f, parent: current });
            } else if (g < existingNode.g) {
                existingNode.g = g;
                existingNode.f = f;
                existingNode.parent = current;
            }
        }

        // Yield current state: closed nodes as "searching", open nodes as "open"
        yield {
            searching: [...closedSet].map((n) => {
                const [row, col] = n.split(",").map(Number);
                return { row, col };
            }),
            open: openSet.map((n) => ({ row: n.row, col: n.col })),
            path: [],
        };
    }

    yield { searching: [], open: [], path: [] }; // No path found
}