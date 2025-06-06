const fs = require("fs");
const path = require("path");
const glob = require("glob-promise");
const { shouldUseSharp } = require("./platform-detection");

// Conditionally load eleventy-img based on platform
let Image;
const useImageProcessing = shouldUseSharp();

if (useImageProcessing) {
    try {
        Image = require("@11ty/eleventy-img");
    } catch (error) {
        console.warn('⚠️  Failed to load @11ty/eleventy-img:', error.message);
        console.warn('   Image processing will be disabled');
        Image = null;
    }
} else {
    console.log('📷 Image processing disabled for this environment');
    Image = null;
}

// For image processing
const THUMB = 250;
const FULL = 1200;
const QUALITY = 95;

async function generateImages() {
    if (!Image) {
        console.log('📷 Skipping image processing - not available in this environment');
        // Copy images directly without processing
        await copyImagesDirectly();
        return;
    }

    let files = await glob('./src/images/**/*.{jpg,jpeg,png}');
    for (const f of files) {
        console.log('process img: ', f);
        const subDir = path.dirname(f).replace(/^\.\/src\/images/, "");

        let processImage = await Image(f, {
            widths: [FULL],
            formats: ['auto'],
            urlPath: "/images/" + subDir,
            outputDir: "./_site/images/" + subDir,
            sharpJpegOptions: {
                quality: QUALITY,
                progressive: false
            },
            filenameFormat: function (id, src, width, format, options) {
                return path.basename(src);
            }
        });
    };
};

/**
 * Fallback function to copy images directly when image processing is not available
 */
async function copyImagesDirectly() {
    let files = await glob('./src/images/**/*.{jpg,jpeg,png,svg,gif}');
    
    for (const f of files) {
        console.log('copy img: ', f);
        const subDir = path.dirname(f).replace(/^\.\/src\/images/, "");
        const outputDir = "./_site/images/" + subDir;
        const filename = path.basename(f);
        const outputPath = path.join(outputDir, filename);
        
        // Ensure output directory exists
        fs.mkdirSync(outputDir, { recursive: true });
        
        // Copy file
        fs.copyFileSync(f, outputPath);
    }
};

module.exports = eleventyConfig => {
    // Render and copy images
    eleventyConfig.on('beforeBuild', async () => {
        console.log('beforeBuild');
        await generateImages();
        console.log('images done');
    });

    // Social images
    eleventyConfig.on('afterBuild', () => {
        if (!Image) {
            console.log('📷 Skipping social image processing - not available in this environment');
            return;
        }
        
        const socialPreviewImagesDir = "_site/images/social-preview-images/";
        fs.readdir(socialPreviewImagesDir, function (err, files) {
            if (err) {
                console.log('📷 No social preview images directory found');
                return;
            }
            
            if (files.length > 0) {
                files.forEach(function (filename) {
                    if (filename.endsWith(".svg")) {
                        let imageUrl = socialPreviewImagesDir + filename;
                        Image(imageUrl, {
                            formats: ["jpeg"],
                            outputDir: "./" + socialPreviewImagesDir,
                            sharpJpegOptions: {
                                quality: QUALITY,
                                progressive: false
                            },
                            filenameFormat: function (id, src, width, format, options) {
                                let outputFilename = filename.substring(0, (filename.length - 4));
                                return `${outputFilename}.${format}`;
                            }
                        });
                    }
                })
            }
        })
    });
};
