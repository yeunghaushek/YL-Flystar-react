function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  function isSubarray(needle, haystack) {
  const n = needle.length, m = haystack.length;
  if (n > m) return false;
  for (let i = 0; i <= m - n; i++) {
    let match = true;
    for (let j = 0; j < n; j++) {
      if (haystack[i + j] !== needle[j]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

function signatureOfDistinct(arr) {
    const unique = Array.from(new Set(arr));
    unique.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    return JSON.stringify(unique);
  }
  



  
  export function mergeOnOverlap(arr1, arr2, k = 3) {
    if (k <= 0) throw new Error("k must be > 0");
    if (arr1.length < k || arr2.length < k) return null;
  
    const tail1 = arr1.slice(-k);
    const head2 = arr2.slice(0, k);
    if (arraysEqual(tail1, head2)) {
      return arr1.concat(arr2.slice(k));
    }
  
    const tail2 = arr2.slice(-k);
    const head1 = arr1.slice(0, k);
    if (arraysEqual(tail2, head1)) {
      return arr2.concat(arr1.slice(k));
    }
  
    return null;
  }

  export function removeDuplicatesAndSubsets(listOfArrays) {
  // 先按長度由大到小，確保較長的先被保留判斷
  const sorted = listOfArrays.slice().sort((a, b) => b.length - a.length);

  const kept = [];
  for (const arr of sorted) {
    let contained = false;
    for (const keptArr of kept) {
      // 若 arr 完全等於 keptArr 或為其連續子陣列，就視為被包含
      if (isSubarray(arr, keptArr)) {
        contained = true;
        break;
      }
    }
    if (!contained) kept.push(arr);
  }

  // 回復到原始輸入的首次出現順序，且只保留一次
  const signatures = new Set(kept.map(a => JSON.stringify(a)));
  const result = [];
  for (const arr of listOfArrays) {
    const sig = JSON.stringify(arr);
    if (signatures.has(sig)) {
      result.push(arr);
      signatures.delete(sig); // 只保留首次出現
    }
  }
  return result;
}

export function removeArraysWithSameDistinct(listOfArrays) {
    const seen = new Set();
    const result = [];
    for (const arr of listOfArrays) {
      const sig = signatureOfDistinct(arr);
      if (!seen.has(sig)) {
        seen.add(sig);
        result.push(arr);
      }
    }
    return result;
  }

  export function unionArrays(listOfArrays) {
    if (!Array.isArray(listOfArrays)) return [];
    const n = listOfArrays.length;
    if (n === 0) return [];

    function haveOverlap(a, b) {
      if (!Array.isArray(a) || !Array.isArray(b)) return false;
      if (a.length === 0 || b.length === 0) return false;
      const setA = new Set(a);
      for (const x of b) {
        if (setA.has(x)) return true;
      }
      return false;
    }

    function unionSequence(arrays) {
      const seen = new Set();
      const result = [];
      for (const arr of arrays) {
        for (const item of arr) {
          if (!seen.has(item)) {
            seen.add(item);
            result.push(item);
          }
        }
      }
      return result;
    }

    const parent = Array.from({ length: n }, (_, i) => i);
    function find(x) {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
      }
      return x;
    }
    function union(a, b) {
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) parent[rb] = ra;
    }

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (haveOverlap(listOfArrays[i], listOfArrays[j])) {
          union(i, j);
        }
      }
    }

    const componentToIndices = new Map();
    for (let i = 0; i < n; i++) {
      const r = find(i);
      if (!componentToIndices.has(r)) componentToIndices.set(r, []);
      componentToIndices.get(r).push(i);
    }

    const components = Array.from(componentToIndices.values());
    components.sort((a, b) => Math.min(...a) - Math.min(...b));

    const results = [];
    for (const indices of components) {
      if (indices.length === 1) {
        results.push(listOfArrays[indices[0]]);
      } else {
        const arraysInOrder = indices.map((idx) => listOfArrays[idx]);
        results.push(unionSequence(arraysInOrder));
      }
    }

    return results;
  }

  export function sortArraysByLengthDesc(listOfArrays) {
    if (!Array.isArray(listOfArrays)) return [];
    return listOfArrays.slice().sort((a, b) => {
      const lenA = Array.isArray(a) ? a.length : 0;
      const lenB = Array.isArray(b) ? b.length : 0;
      return lenB - lenA;
    });
  }

  export function sortArraysByTailSimilarity(listOfArrays) {
    if (!Array.isArray(listOfArrays)) return [];
    const n = listOfArrays.length;
    if (n <= 1) return listOfArrays.slice();

    function commonSuffixLength(a, b) {
      if (!Array.isArray(a) || !Array.isArray(b)) return 0;
      let i = a.length - 1;
      let j = b.length - 1;
      let count = 0;
      while (i >= 0 && j >= 0 && a[i] === b[j]) {
        count++;
        i--;
        j--;
      }
      return count;
    }

    const scored = listOfArrays.map((arr, idx) => {
      let maxSuffix = 0;
      for (let j = 0; j < n; j++) {
        if (j === idx) continue;
        const score = commonSuffixLength(arr, listOfArrays[j]);
        if (score > maxSuffix) maxSuffix = score;
      }
      return { index: idx, score: maxSuffix, arr };
    });

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.index - b.index; // 保持穩定性（原始順序）
    });

    return scored.map(s => s.arr);
  }


  export function sortArraysByHeadThenTail(listOfArrays) {
    if (!Array.isArray(listOfArrays)) return [];
    const n = listOfArrays.length;
    if (n <= 1) return listOfArrays.slice();

    function commonPrefixLengthFromIndex1(a, b) {
      if (!Array.isArray(a) || !Array.isArray(b)) return 0;
      let i = 1;
      let j = 1;
      let count = 0;
      while (i < a.length && j < b.length && a[i] === b[j]) {
        count++;
        i++;
        j++;
      }
      return count;
    }

    function hasDuplicateOnOddIndices(a) {
      if (!Array.isArray(a) || a.length < 5) return false;
      const seen = new Set();
      for (let i = 1; i < a.length; i += 2) {
        const v = a[i];
        if (seen.has(v)) return true;
        seen.add(v);
      }
      return false;
    }

    function commonSuffixLength(a, b) {
      if (!Array.isArray(a) || !Array.isArray(b)) return 0;
      let i = a.length - 1;
      let j = b.length - 1;
      let count = 0;
      while (i >= 0 && j >= 0 && a[i] === b[j]) {
        count++;
        i--;
        j--;
      }
      return count;
    }

    const scored = listOfArrays.map((arr, idx) => {
      let head = 0;
      let tail = 0;
      const superPriority = hasDuplicateOnOddIndices(arr);
      for (let j = 0; j < n; j++) {
        if (j === idx) continue;
        const other = listOfArrays[j];
        const h = commonPrefixLengthFromIndex1(arr, other);
        if (h > head) head = h;
        const t = commonSuffixLength(arr, other);
        if (t > tail) tail = t;
      }
      return { index: idx, head, tail, superPriority, arr };
    });

    scored.sort((a, b) => {
      if (Number(b.superPriority) !== Number(a.superPriority)) return Number(b.superPriority) - Number(a.superPriority);
      if (b.head !== a.head) return b.head - a.head;
      if (b.tail !== a.tail) return b.tail - a.tail;
      return a.index - b.index; // 穩定排序
    });

    return scored.map(s => s.arr);
  }