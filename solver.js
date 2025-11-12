let calls = 0

function getShuffledNumbers() {
	const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

	for (let i = numbers.length - 1; i > 0; --i) {
		const r = Math.floor(Math.random() * (i + 1));
		[numbers[i], numbers[r]] = [numbers[r], numbers[i]];
	}

	return numbers;
}

function solveRecursively(coordinateIndex, maskBitmaps, cells, emptyCellDatas) {
	if (++calls > 20000000000) {
		throw 'timeout'
	}

	if (coordinateIndex >= emptyCellDatas.length) {
		throw 'solved'
	}

	const {
		cellIndex,
		rowIndex,
		colIndex,
		blockIndex,
		groupInfo,
		random,
	} = emptyCellDatas[coordinateIndex]

	if (groupInfo) {
		++groupInfo.count
	}

	const rowBitmap = maskBitmaps[rowIndex]
	const colBitmap = maskBitmaps[colIndex]
	const blockBitmap = maskBitmaps[blockIndex]
	const oldSum = groupInfo?.sum ?? 0
	const count = groupInfo?.count
	const requiredCount = groupInfo?.requiredCount
	const requiredSum = groupInfo?.requiredSum
	const randomNumbers = random ? getShuffledNumbers() : null

	for (let i = 1; i <= 9; ++i) {
		const val = random ? randomNumbers[i - 1] : i
		const maskValue = 1 << (val - 1)
		const newSum = oldSum + val

		if (maskValue & rowBitmap) {
			continue
		}

		if (maskValue & colBitmap) {
			continue
		}

		if (maskValue & blockBitmap) {
			continue
		}

		if (groupInfo) {
			if (requiredSum < newSum || count === requiredCount && requiredSum !== newSum) {
				continue
			}

			groupInfo.sum = newSum
		}

		maskBitmaps[rowIndex] = maskValue | rowBitmap
		maskBitmaps[colIndex] = maskValue | colBitmap
		maskBitmaps[blockIndex] = maskValue | blockBitmap
		cells[cellIndex] = val

		solveRecursively(coordinateIndex + 1, maskBitmaps, cells, emptyCellDatas)
	}

	if (groupInfo) {
		--groupInfo.count
		groupInfo.sum = oldSum
	}

	maskBitmaps[rowIndex] = rowBitmap
	maskBitmaps[colIndex] = colBitmap
	maskBitmaps[blockIndex] = blockBitmap
	cells[cellIndex] = 0
}

self.onmessage = message => {
	setTimeout(() => {
		const { coordinateIndex, maskBitmaps, cells, emptyCellDatas } = message.data

		try {
			solveRecursively(coordinateIndex, maskBitmaps, cells, emptyCellDatas)
			throw 'unsolvable'
		} catch (message) {
			self.postMessage({ cells, message, calls })
		}
	});
}
