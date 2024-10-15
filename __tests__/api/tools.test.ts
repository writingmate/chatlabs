jest.mock("@supabase/ssr")
jest.mock('../../lib/supabase/server')
jest.mock('../../db/tools')
jest.mock('next/headers', () => ({
    cookies: jest.fn(),
}));
jest.mock('../../lib/platformTools/utils/platformToolsUtils')

import { NextRequest, NextResponse } from 'next/server'
import { GET, POST, PUT, PATCH, DELETE } from '../../app/api/tools/[...segments]/route'
import { createClient } from '../../lib/supabase/server'
import { getToolById } from '../../db/tools'
import { platformToolDefinitions, platformToolFunctionSpec } from '../../lib/platformTools/utils/platformToolsUtils'

describe('Proxy API', () => {
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
        jest.clearAllMocks()
        originalFetch = global.fetch;
        global.fetch = jest.fn();
    })

    afterEach(() => {
        global.fetch = originalFetch;
    })

    it('should handle regular tool request', async () => {
        const mockTool: {
            id: string;
            schema: string;
            custom_headers: string;
        } = {
            id: 'test-tool',
            schema: JSON.stringify({
                paths: {
                    '/test': {
                        get: {
                            operationId: 'testOperation'
                        }
                    }
                },
                servers: [{ url: 'https://api.example.com/' }]
            }),
            custom_headers: JSON.stringify({ 'x-test-header': 'test-value' })
        };

        (getToolById as jest.Mock).mockResolvedValue(mockTool);
        (createClient as jest.Mock).mockReturnValue({});

        (global.fetch as jest.Mock).mockResolvedValue({
            status: 200,
            statusText: 'OK',
            headers: new Headers(),
            text: jest.fn().mockResolvedValue('{"result": "success"}')
        });

        const mockNextRequest = {
            url: 'http://localhost:3000/api/proxy/toolId/path',
            headers: new Headers(),
            method: 'GET',
        } as unknown as NextRequest;

        const response = await GET(mockNextRequest, { params: { segments: ['test-tool', 'test'] } });

        expect(getToolById).toHaveBeenCalledWith('test-tool', expect.anything());
        expect(global.fetch).toHaveBeenCalledWith("https://api.example.com/test", {
            method: 'GET',
            headers: { "x-test-header": "test-value" },
            body: null
        });

        expect(response).toEqual(expect.objectContaining({
            status: 200,
            headers: expect.any(Headers),
        }));
        expect(await response.json()).toEqual({ result: 'success' });
    })

    it('should handle platform tool request', async () => {
        const mockPlatformTool: {
            id: string;
            schema: string;
            sharing: 'platform'
        } = {
            id: 'platform-tool',
            sharing: 'platform',
            schema: JSON.stringify({
                servers: [{ url: 'local://executor' }],
                paths: {
                    '/test': {
                        get: {
                            operationId: 'platformTestOperation'
                        }
                    }
                }
            })
        };

        (getToolById as jest.Mock).mockRejectedValue(new Error('Tool not found'));
        (platformToolDefinitions as jest.Mock).mockReturnValue([mockPlatformTool]);
        (platformToolFunctionSpec as jest.Mock).mockReturnValue({
            toolFunction: jest.fn().mockResolvedValue({ result: 'platform success' })
        });

        const mockRequest = {
            url: 'http://localhost/api/proxy/platform-tool/test',
            method: 'GET',
            headers: new Headers(),
        } as unknown as NextRequest;

        const response = await GET(mockRequest, { params: { segments: ['platform-tool', 'test'] } });

        expect(getToolById).toHaveBeenCalledWith('platform-tool', expect.anything());
        expect(platformToolDefinitions).toHaveBeenCalled();
        expect(platformToolFunctionSpec).toHaveBeenCalledWith('platformTestOperation');
        expect(await response.json()).toEqual({ result: 'platform success' });
    })

    it('should handle POST request with form data', async () => {
        const mockTool = {
            id: 'form-tool',
            schema: JSON.stringify({
                paths: {
                    '/form': {
                        post: {
                            operationId: 'formOperation'
                        }
                    }
                },
                servers: [{ url: 'https://api.example.com/' }]
            }),
            custom_headers: JSON.stringify({
                "X-Api-Key": "test-api-key"
            })
        };

        (getToolById as jest.Mock).mockResolvedValue(mockTool);
        (createClient as jest.Mock).mockReturnValue({});

        (global.fetch as jest.Mock).mockResolvedValue({
            status: 200,
            statusText: 'OK',
            headers: new Headers(),
            text: jest.fn().mockResolvedValue('{"result": "form success"}')
        });

        const formData = new FormData();
        formData.append('key', 'value');

        const mockRequest = {
            url: 'http://localhost/api/proxy/form-tool/form',
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'multipart/form-data' }),
            formData: () => Promise.resolve(formData),
        } as unknown as NextRequest;

        const response = await POST(mockRequest, { params: { segments: ['form-tool', 'form'] } });

        expect(getToolById).toHaveBeenCalledWith('form-tool', expect.anything());
        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.example.com/form',
            {
                method: 'POST',
                headers: {
                    "x-api-key": "test-api-key"
                },
                body: formData
            }
        );
        expect(await response.json()).toEqual({ result: 'form success' });
    })

    it('should handle route with path parameters', async () => {
        const mockTool = {
            id: 'param-tool',
            schema: JSON.stringify({
                paths: {
                    '/users/{userId}/posts/{postId}': {
                        get: {
                            operationId: 'getUserPost'
                        }
                    }
                },
                servers: [{ url: 'https://api.example.com/' }]
            }),
            custom_headers: JSON.stringify({})
        };

        (getToolById as jest.Mock).mockResolvedValue(mockTool);
        (createClient as jest.Mock).mockReturnValue({});

        (global.fetch as jest.Mock).mockResolvedValue({
            status: 200,
            statusText: 'OK',
            headers: new Headers(),
            text: jest.fn().mockResolvedValue('{"userId": "123", "postId": "456", "content": "Test post"}')
        });

        const mockRequest = {
            url: 'http://localhost/api/proxy/param-tool/users/123/posts/456',
            method: 'GET',
            headers: new Headers(),
        } as unknown as NextRequest;

        const response = await GET(mockRequest, { params: { segments: ['param-tool', 'users', '123', 'posts', '456'] } });

        expect(getToolById).toHaveBeenCalledWith('param-tool', expect.anything());
        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.example.com/users/123/posts/456',
            expect.objectContaining({
                method: 'GET',
                headers: expect.any(Object),
                body: null
            })
        );

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            userId: '123',
            postId: '456',
            content: 'Test post'
        });
    });

    it('should handle route with path parameters and query parameters', async () => {
        const mockTool = {
            id: 'param-query-tool',
            schema: JSON.stringify({
                paths: {
                    '/users/{userId}/posts': {
                        get: {
                            operationId: 'getUserPosts'
                        }
                    }
                },
                servers: [{ url: 'https://api.example.com/' }]
            }),
            custom_headers: JSON.stringify({})
        };

        (getToolById as jest.Mock).mockResolvedValue(mockTool);
        (createClient as jest.Mock).mockReturnValue({});

        (global.fetch as jest.Mock).mockResolvedValue({
            status: 200,
            statusText: 'OK',
            headers: new Headers(),
            text: jest.fn().mockResolvedValue('{"userId": "123", "posts": [{"id": "1", "title": "Test post"}]}')
        });

        const mockRequest = {
            url: 'http://localhost/api/proxy/param-query-tool/users/123/posts?limit=10&offset=0',
            method: 'GET',
            headers: new Headers(),
        } as unknown as NextRequest;

        const response = await GET(mockRequest, { params: { segments: ['param-query-tool', 'users', '123', 'posts'] } });

        expect(getToolById).toHaveBeenCalledWith('param-query-tool', expect.anything());
        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.example.com/users/123/posts?limit=10&offset=0',
            expect.objectContaining({
                method: 'GET',
                headers: expect.any(Object),
                body: null
            })
        );

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            userId: '123',
            posts: [{ id: '1', title: 'Test post' }]
        });
    });
});
