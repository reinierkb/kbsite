const os = require('os');

// Mock os module
jest.mock('os');

const { getPlatformInfo, isDevContainer, shouldUseSharp } = require('../config/platform-detection');

describe('Platform Detection', () => {
    beforeEach(() => {
        // Reset environment variables
        delete process.env.REMOTE_CONTAINERS;
        delete process.env.CODESPACES;
        delete process.env.DEVCONTAINER;
        delete process.env.VSCODE_REMOTE_CONTAINERS_SESSION;
        delete process.env.FORCE_SHARP;
        
        // Reset mocks
        jest.clearAllMocks();
    });
    
    describe('getPlatformInfo', () => {
        test('detects ARM64 Darwin platform', () => {
            os.platform.mockReturnValue('darwin');
            os.arch.mockReturnValue('arm64');
            
            const result = getPlatformInfo();
            
            expect(result).toEqual({
                platform: 'darwin',
                arch: 'arm64',
                isArm64: true,
                isIntel: false,
                isDarwin: true,
                isLinux: false,
                isWindows: false
            });
        });
        
        test('detects x64 Linux platform', () => {
            os.platform.mockReturnValue('linux');
            os.arch.mockReturnValue('x64');
            
            const result = getPlatformInfo();
            
            expect(result).toEqual({
                platform: 'linux',
                arch: 'x64',
                isArm64: false,
                isIntel: true,
                isDarwin: false,
                isLinux: true,
                isWindows: false
            });
        });
        
        test('detects Windows platform', () => {
            os.platform.mockReturnValue('win32');
            os.arch.mockReturnValue('x64');
            
            const result = getPlatformInfo();
            
            expect(result).toEqual({
                platform: 'win32',
                arch: 'x64',
                isArm64: false,
                isIntel: true,
                isDarwin: false,
                isLinux: false,
                isWindows: true
            });
        });
    });
    
    describe('isDevContainer', () => {
        test('detects devcontainer via REMOTE_CONTAINERS env var', () => {
            process.env.REMOTE_CONTAINERS = 'true';
            expect(isDevContainer()).toBe(true);
        });
        
        test('detects devcontainer via CODESPACES env var', () => {
            process.env.CODESPACES = 'true';
            expect(isDevContainer()).toBe(true);
        });
        
        test('detects devcontainer via DEVCONTAINER env var', () => {
            process.env.DEVCONTAINER = 'true';
            expect(isDevContainer()).toBe(true);
        });
        
        test('detects devcontainer via VSCODE_REMOTE_CONTAINERS_SESSION env var', () => {
            process.env.VSCODE_REMOTE_CONTAINERS_SESSION = 'some-session-id';
            expect(isDevContainer()).toBe(true);
        });
        
        test('returns false when no devcontainer env vars present', () => {
            expect(isDevContainer()).toBe(false);
        });
    });
    
    describe('shouldUseSharp', () => {
        test('returns false in devcontainer without FORCE_SHARP', () => {
            process.env.DEVCONTAINER = 'true';
            os.platform.mockReturnValue('linux');
            os.arch.mockReturnValue('x64');
            
            const result = shouldUseSharp();
            expect(result).toBe(false);
        });
        
        test('returns true in devcontainer with FORCE_SHARP=true', () => {
            process.env.DEVCONTAINER = 'true';
            process.env.FORCE_SHARP = 'true';
            os.platform.mockReturnValue('linux');
            os.arch.mockReturnValue('x64');
            
            const result = shouldUseSharp();
            expect(result).toBe(true);
        });
        
        test('returns true on ARM64 systems', () => {
            os.platform.mockReturnValue('darwin');
            os.arch.mockReturnValue('arm64');
            
            const result = shouldUseSharp();
            expect(result).toBe(true);
        });
        
        test('returns true on native x64 systems', () => {
            os.platform.mockReturnValue('darwin');
            os.arch.mockReturnValue('x64');
            
            const result = shouldUseSharp();
            expect(result).toBe(true);
        });
        
        test('returns true for unknown architectures by default', () => {
            os.platform.mockReturnValue('linux');
            os.arch.mockReturnValue('unknown-arch');
            
            const result = shouldUseSharp();
            expect(result).toBe(true);
        });
    });
});