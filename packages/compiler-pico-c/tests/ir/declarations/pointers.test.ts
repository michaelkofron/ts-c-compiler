import '../utils/irMatcher';

describe('Pointer declarations IR', () => {
  describe('Uninitialized', () => {
    test('should generate alloc for int* type', () => {
      expect(/* cpp */ `void main() { int* a; }`).toCompiledIRBeEqual(/* ruby */`
        # --- Block main ---
        def main(): [ret 0B]
          a{0}: int**2B = alloca int*2B
          ret
      `);
    });

    test('should generate alloc for int* var[5] type', () => {
      expect(/* cpp */ `void main() { int* var[5]; }`).toCompiledIRBeEqual(/* ruby */`
        # --- Block main ---
        def main(): [ret 0B]
          var{0}: int*[5]*2B = alloca int*[5]10B
          ret
      `);
    });

    test('should generate alloc for int (*var)[5] type', () => {
      expect(/* cpp */ `void main() { int (*var)[5]; }`).toCompiledIRBeEqual(/* ruby */`
        # --- Block main ---
        def main(): [ret 0B]
          var{0}: int[5]**2B = alloca int[5]*2B
          ret
      `);
    });

    test('should generate alloc for int** (*var)[5] type', () => {
      expect(/* cpp */ `void main() { int** (*var)[5]; }`).toCompiledIRBeEqual(/* ruby */`
        # --- Block main ---
        def main(): [ret 0B]
          var{0}: int**[5]**2B = alloca int**[5]*2B
          ret
      `);
    });

    test('should generate alloc for int** (*var)[3][5] type', () => {
      expect(/* cpp */ `void main() { int** (*var)[3][5]; }`).toCompiledIRBeEqual(/* ruby */`
        # --- Block main ---
        def main(): [ret 0B]
          var{0}: int**[3][5]**2B = alloca int**[3][5]*2B
          ret
      `);
    });

    test('should generate alloc for int** (*var[1][2])[3][5] type', () => {
      expect(/* cpp */ `void main() { int** (*var[1][2])[3][5]; }`).toCompiledIRBeEqual(/* ruby */`
        # --- Block main ---
        def main(): [ret 0B]
          var{0}: int**[3][5]*[1][2]*2B = alloca int**[3][5]*[1][2]4B
          ret
      `);
    });
  });

  describe('Initialized', () => {
    test('add to pointer without address unary', () => {
      expect(/* cpp */ `
        void main() {
          int a = 123;
          int* b = a + 2;
        }
      `).toCompiledIRBeEqual(/* ruby */`
        # --- Block main ---
        def main(): [ret 0B]
          a{0}: int*2B = alloca int2B
          *(a{0}: int*2B) = store %123: int2B
          b{0}: int**2B = alloca int*2B
          t{0}: int2B = load a{0}: int*2B
          t{1}: int2B = t{0}: int2B PLUS %2: int2B
          *(b{0}: int**2B) = store t{1}: int2B
          ret
      `);
    });

    test('loads pointer pointing value and adds to primitive', () => {
      expect(/* cpp */ `
        void main() {
          int a = 123;
          int* b = &a;
          int c = *b + 4;
        }
      `).toCompiledIRBeEqual(/* ruby */`
        # --- Block main ---
        def main(): [ret 0B]
          a{0}: int*2B = alloca int2B
          *(a{0}: int*2B) = store %123: int2B
          b{0}: int**2B = alloca int*2B
          t{0}: int*2B = lea a{0}: int*2B
          *(b{0}: int**2B) = store t{0}: int*2B
          c{0}: int*2B = alloca int2B
          t{1}: int*2B = load b{0}: int**2B
          t{2}: int2B = load t{1}: int*2B
          t{3}: int2B = t{2}: int2B PLUS %4: int2B
          *(c{0}: int*2B) = store t{3}: int2B
          ret
      `);
    });

    test('loads array pointer as primitive', () => {
      expect(/* cpp */ `
        void main() {
          int arr[] = { 1, 2, 3, 4, 5, 6 };
          int ptr = *arr;
        }
      `).toCompiledIRBeEqual(/* ruby */`
        # --- Block main ---
        def main(): [ret 0B]
          arr{0}: int**2B = alloca int*2B
          t{0}: int*2B = lea c{0}: int[6]12B
          *(arr{0}: int**2B) = store t{0}: int*2B
          ptr{0}: int*2B = alloca int2B
          t{1}: int*2B = load arr{0}: int**2B
          t{2}: int2B = load t{1}: int*2B
          *(ptr{0}: int*2B) = store t{2}: int2B
          ret

        # --- Block Data ---
          c{0}: int[6]12B = const { 1, 2, 3, 4, 5, 6 }
      `);
    });
  });
});