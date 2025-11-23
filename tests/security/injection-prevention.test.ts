/**
 * Security Tests - Injection Prevention
 * Tests for SQL injection and command injection prevention
 */

import { sanitizeString, sanitizeSqlString, sanitizeUuid } from '../../src/utils/validators.js';

describe('SQL Injection Prevention', () => {
  describe('sanitizeSqlString', () => {
    it('should escape single quotes', () => {
      const input = "test'value";
      const result = sanitizeSqlString(input);
      expect(result).toBe("test''value");
    });

    it('should handle multiple single quotes', () => {
      const input = "'; DROP TABLE users; --";
      const result = sanitizeSqlString(input);
      expect(result).toBe("''; DROP TABLE users; --");
    });

    it('should handle empty string', () => {
      const result = sanitizeSqlString('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeUuid', () => {
    it('should accept valid UUIDs', () => {
      const validUuids = [
        'abc123',
        'test-uuid-123',
        '550e8400-e29b-41d4-a716-446655440000',
      ];

      validUuids.forEach(uuid => {
        expect(() => sanitizeUuid(uuid)).not.toThrow();
      });
    });

    it('should reject SQL injection attempts', () => {
      const maliciousInputs = [
        "'; DROP TABLE applications; --",
        "abc' OR '1'='1",
        "test; DELETE FROM users",
      ];

      maliciousInputs.forEach(input => {
        expect(() => sanitizeUuid(input)).toThrow('Invalid UUID format detected');
      });
    });

    it('should reject special characters', () => {
      const invalidInputs = [
        'test$value',
        'test`command`',
        'test|pipe',
        'test;semicolon',
      ];

      invalidInputs.forEach(input => {
        expect(() => sanitizeUuid(input)).toThrow('Invalid UUID format detected');
      });
    });
  });
});

describe('Command Injection Prevention', () => {
  describe('sanitizeString', () => {
    it('should remove shell metacharacters', () => {
      const input = 'test;rm -rf /';
      const result = sanitizeString(input);
      expect(result).not.toContain(';');
      expect(result).not.toContain('/');
    });

    it('should remove dangerous characters', () => {
      const dangerousChars = ['&', '|', '$', '`', '(', ')', '{', '}', '[', ']'];

      dangerousChars.forEach(char => {
        const input = `test${char}command`;
        const result = sanitizeString(input);
        expect(result).not.toContain(char);
      });
    });

    it('should remove quotes', () => {
      const input = `test"value'with'quotes`;
      const result = sanitizeString(input);
      expect(result).not.toContain("'");
      expect(result).not.toContain('"');
    });

    it('should trim whitespace', () => {
      const input = '  test  ';
      const result = sanitizeString(input);
      expect(result).toBe('test');
    });
  });
});

describe('UUID Validation Pattern', () => {
  it('should match valid Coolify UUIDs', () => {
    const uuidPattern = /^[a-zA-Z0-9\-]+$/;

    const validUuids = [
      'abc123def456',
      'test-uuid-123',
      'App-Model-123',
      '550e8400-e29b-41d4-a716-446655440000',
    ];

    validUuids.forEach(uuid => {
      expect(uuid).toMatch(uuidPattern);
    });
  });

  it('should reject invalid UUIDs', () => {
    const uuidPattern = /^[a-zA-Z0-9\-]+$/;

    const invalidUuids = [
      "'; DROP TABLE",
      'test$value',
      'test;command',
      'test|pipe',
      'test`backtick',
      'test(parens)',
    ];

    invalidUuids.forEach(uuid => {
      expect(uuid).not.toMatch(uuidPattern);
    });
  });
});

describe('Security Edge Cases', () => {
  it('should handle null bytes', () => {
    const input = 'test\x00value';
    const result = sanitizeString(input);
    expect(result).toBe('testvalue');
  });

  it('should handle unicode characters safely', () => {
    const input = 'test\u0000value';
    const result = sanitizeString(input);
    // Should not throw, should handle gracefully
    expect(result).toBeDefined();
  });

  it('should handle very long inputs', () => {
    const longInput = 'a'.repeat(10000);
    expect(() => sanitizeString(longInput)).not.toThrow();
  });
});
