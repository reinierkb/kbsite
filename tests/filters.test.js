const { DateTime } = require("luxon");

// Import the filter functions by requiring the module and extracting the functions
let filters = {};

// Mock Eleventy config to capture filter registrations
const mockConfig = {
    addFilter: (name, fn) => {
        filters[name] = fn;
    }
};

// Load the filters
require('../config/filters')(mockConfig);

describe('Date Filters', () => {
    const testDate = new Date('2023-07-14T10:30:00Z');
    
    describe('readablePostDate', () => {
        test('formats date in Dutch locale with Amsterdam timezone', () => {
            const result = filters.readablePostDate(testDate);
            expect(result).toBe('14 juli, 2023');
        });
        
        test('handles different dates correctly', () => {
            const newYearDate = new Date('2024-01-01T00:00:00Z');
            const result = filters.readablePostDate(newYearDate);
            expect(result).toBe('1 januari, 2024');
        });
    });
    
    describe('readablePostDateTime', () => {
        test('formats date and time in Dutch locale with Amsterdam timezone', () => {
            const result = filters.readablePostDateTime(testDate);
            expect(result).toBe('14 juli, 2023 12:30');
        });
        
        test('handles midnight correctly', () => {
            const midnightDate = new Date('2023-12-25T23:00:00Z'); // 00:00 Amsterdam time (CET is UTC+1)
            const result = filters.readablePostDateTime(midnightDate);
            expect(result).toBe('26 december, 2023 00:00');
        });
    });
    
    describe('postDate', () => {
        test('returns ISO date string', () => {
            const result = filters.postDate(testDate);
            expect(result).toBe('2023-07-14');
        });
        
        test('handles timezone conversion for ISO date', () => {
            const lateNightDate = new Date('2023-07-14T23:00:00Z'); // Next day in Amsterdam
            const result = filters.postDate(lateNightDate);
            expect(result).toBe('2023-07-15');
        });
    });
});

describe('URL Hostname Filter', () => {
    describe('urlHostname', () => {
        test('extracts hostname from URL without www', () => {
            const result = filters.urlHostname('https://example.com/path');
            expect(result).toBe('example.com');
        });
        
        test('removes www prefix from hostname', () => {
            const result = filters.urlHostname('https://www.example.com/path');
            expect(result).toBe('example.com');
        });
        
        test('handles different protocols', () => {
            const httpResult = filters.urlHostname('http://www.test.org');
            expect(httpResult).toBe('test.org');
            
            const httpsResult = filters.urlHostname('https://www.test.org');
            expect(httpsResult).toBe('test.org');
        });
        
        test('handles subdomains correctly', () => {
            const result = filters.urlHostname('https://blog.example.com');
            expect(result).toBe('blog.example.com');
        });
        
        test('handles URLs with query parameters and fragments', () => {
            const result = filters.urlHostname('https://www.example.com/path?query=value#fragment');
            expect(result).toBe('example.com');
        });
        
        test('throws error for invalid URLs', () => {
            expect(() => {
                filters.urlHostname('not-a-url');
            }).toThrow();
        });
    });
});

describe('Text Wrapping Filters', () => {
    describe('splitlines', () => {
        test('wraps text to 32 character lines', () => {
            const longText = 'This is a very long line that should be split into multiple lines based on the character limit';
            const result = filters.splitlines(longText);
            
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(1);
            
            // Check that each line (except possibly the last) is within the limit
            result.forEach((line, index) => {
                if (index < result.length - 1) {
                    expect(line.length).toBeLessThanOrEqual(32);
                }
            });
        });
        
        test('handles short text that fits in one line', () => {
            const shortText = 'Short text';
            const result = filters.splitlines(shortText);
            
            expect(result).toEqual(['Short text']);
        });
        
        test('handles empty string', () => {
            const result = filters.splitlines('');
            expect(result).toEqual(['']);
        });
        
        test('handles single word longer than line width', () => {
            const longWord = 'supercalifragilisticexpialidocious';
            const result = filters.splitlines(longWord);
            
            expect(result).toEqual([longWord]);
        });
    });
    
    describe('splitlinespost', () => {
        test('wraps text to 28 character lines', () => {
            const longText = 'This is a long line for post social images that needs wrapping';
            const result = filters.splitlinespost(longText);
            
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(1);
            
            // Check that each line (except possibly the last) is within the limit
            result.forEach((line, index) => {
                if (index < result.length - 1) {
                    expect(line.length).toBeLessThanOrEqual(28);
                }
            });
        });
        
        test('creates shorter lines than splitlines filter', () => {
            const text = 'This is a test text that will be wrapped differently by each filter';
            const regularResult = filters.splitlines(text);
            const postResult = filters.splitlinespost(text);
            
            // Post version should have more lines (shorter width)
            expect(postResult.length).toBeGreaterThanOrEqual(regularResult.length);
        });
    });
});

describe('Utility Filters', () => {
    describe('limit', () => {
        test('limits array to specified number of items', () => {
            const array = [1, 2, 3, 4, 5];
            const result = filters.limit(array, 3);
            
            expect(result).toEqual([1, 2, 3]);
        });
        
        test('returns full array if limit is greater than array length', () => {
            const array = [1, 2, 3];
            const result = filters.limit(array, 5);
            
            expect(result).toEqual([1, 2, 3]);
        });
        
        test('returns empty array when limit is 0', () => {
            const array = [1, 2, 3];
            const result = filters.limit(array, 0);
            
            expect(result).toEqual([]);
        });
        
        test('handles empty array', () => {
            const result = filters.limit([], 3);
            expect(result).toEqual([]);
        });
    });
});