let calls = 0

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
		groupInfo
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

	for (let val = 1; val <= 9; ++val) {
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
