const { getAllPosts } = require('../config/collections');

describe('Collections', () => {
    describe('getAllPosts', () => {
        test('returns blog posts in reverse order', () => {
            // Mock collection with getFilteredByGlob method
            const mockPosts = [
                { 
                    data: { title: 'First Post', date: new Date('2023-01-01') },
                    fileSlug: 'first-post'
                },
                { 
                    data: { title: 'Second Post', date: new Date('2023-02-01') },
                    fileSlug: 'second-post'
                },
                { 
                    data: { title: 'Third Post', date: new Date('2023-03-01') },
                    fileSlug: 'third-post'
                }
            ];
            
            const mockCollection = {
                getFilteredByGlob: jest.fn().mockReturnValue(mockPosts)
            };
            
            const result = getAllPosts(mockCollection);
            
            // Verify it called getFilteredByGlob with correct pattern
            expect(mockCollection.getFilteredByGlob).toHaveBeenCalledWith('./src/blog/**/*.md');
            
            // Verify it returns reversed array
            expect(result).toEqual([
                { 
                    data: { title: 'Third Post', date: new Date('2023-03-01') },
                    fileSlug: 'third-post'
                },
                { 
                    data: { title: 'Second Post', date: new Date('2023-02-01') },
                    fileSlug: 'second-post'
                },
                { 
                    data: { title: 'First Post', date: new Date('2023-01-01') },
                    fileSlug: 'first-post'
                }
            ]);
        });
        
        test('handles empty collection', () => {
            const mockCollection = {
                getFilteredByGlob: jest.fn().mockReturnValue([])
            };
            
            const result = getAllPosts(mockCollection);
            
            expect(mockCollection.getFilteredByGlob).toHaveBeenCalledWith('./src/blog/**/*.md');
            expect(result).toEqual([]);
        });
        
        test('handles single post', () => {
            const singlePost = [
                { 
                    data: { title: 'Only Post', date: new Date('2023-01-01') },
                    fileSlug: 'only-post'
                }
            ];
            
            const mockCollection = {
                getFilteredByGlob: jest.fn().mockReturnValue(singlePost)
            };
            
            const result = getAllPosts(mockCollection);
            
            expect(result).toEqual(singlePost);
        });
        
        test('maintains post structure after reversal', () => {
            const mockPosts = [
                { 
                    data: { 
                        title: 'Post A',
                        date: new Date('2023-01-01'),
                        tags: ['tag1', 'tag2']
                    },
                    fileSlug: 'post-a',
                    url: '/blog/post-a/'
                },
                { 
                    data: { 
                        title: 'Post B',
                        date: new Date('2023-02-01'),
                        tags: ['tag2', 'tag3']
                    },
                    fileSlug: 'post-b',
                    url: '/blog/post-b/'
                }
            ];
            
            const mockCollection = {
                getFilteredByGlob: jest.fn().mockReturnValue(mockPosts)
            };
            
            const result = getAllPosts(mockCollection);
            
            // Should reverse order but maintain all properties
            expect(result[0]).toEqual({
                data: { 
                    title: 'Post B',
                    date: new Date('2023-02-01'),
                    tags: ['tag2', 'tag3']
                },
                fileSlug: 'post-b',
                url: '/blog/post-b/'
            });
            
            expect(result[1]).toEqual({
                data: { 
                    title: 'Post A',
                    date: new Date('2023-01-01'),
                    tags: ['tag1', 'tag2']
                },
                fileSlug: 'post-a',
                url: '/blog/post-a/'
            });
        });
    });
});