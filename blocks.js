const { registerBlockType } = wp.blocks;
const { createElement: el } = wp.element;
const { useState } = wp.element;
const { useEffect, useRef } = wp.element;
const { TextControl: WPTextControl, TextareaControl: WPTextareaControl, SelectControl: WPSelectControl, Button } = wp.components;
const { MediaUpload, MediaUploadCheck, useBlockProps } = wp.blockEditor || wp.editor;

const moreBtnImg = `${pluginSettings.pluginUrl}assets/images/puscica.svg`;
const xBtn = `${pluginSettings.pluginUrl}assets/images/delete.svg`;


// CONSTANTS:

const TextControl = (props) =>
    React.createElement(WPTextControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        ...props,
    });

const TextareaControl = (props) =>
    React.createElement(WPTextareaControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        ...props,
    });

const SelectControl = (props) =>
    React.createElement(WPSelectControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        ...props,
    });

const ImageThumbnailPlaceholder = ({ imageUrl, emptyText = 'No image selected' }) =>
    el(
        'div',
        { className: 'thumbnail-wrapp' },
        imageUrl
            ? el('img', {
                src: imageUrl,
                className: 'thumbnail-preview',
            })
            : el(
                'div',
                { className: 'thumbnail-placeholder' },
                emptyText
            )
    );
const usePagesOptions = () => {
    const { pages, currentPage } = wp.data.useSelect((select) => {
        const pages = select('core').getEntityRecords('postType', 'page', {
            per_page: -1,
        });

        const currentId = select('core/editor').getCurrentPostId();
        const currentPage = currentId
            ? select('core').getEntityRecord('postType', 'page', currentId)
            : null;

        return { pages, currentPage };
    }, []);

    if (!pages) return { options: [], currentUrl: '' };

    const options = [
        { label: 'No link', value: '' },
        { label: 'Current page', value: currentPage?.link || '' },
        ...pages.map((page) => ({
            label: page.title.rendered,
            value: page.link,
        }))
    ];

    return {
        options,
        currentUrl: currentPage?.link || ''
    };
};

const UploadButton = ({ onClick, label = 'Upload Image' }) =>
    el(
        Button,
        {
            className: 'button-add-sub',
            onClick,
            isSecondary: true,
        },
        label
    );

const RemoveButton = ({ onClick, visible, label = 'Delete' }) => {
    if (!visible) return null;
    return el(
        Button,
        {
            className: 'remove-btn',
            onClick,
            isDestructive: true,
        },
        label
    );
};

const EditorImageField = ({
    label,
    labelClassName = 'block-label',
    imageUrl,
    onSelect,
    onRemove,
    uploadLabel = 'Upload Image',
    removeLabel = 'Delete',
    emptyText = 'No image selected',
    className = '',
    hideUploadWhenImageExists = true,
}) =>
    React.createElement(
        'div',
        { className: `editor-media-field ${className}`.trim() },
        [
            label ? el('label', { className: labelClassName }, label) : null,
            React.createElement(ImageThumbnailPlaceholder, {
                imageUrl,
                emptyText,
            }),
            React.createElement(
                'div',
                { className: 'editor-media-actions' },
                React.createElement(MediaUploadCheck, {},
                    React.createElement(MediaUpload, {
                        onSelect,
                        allowedTypes: ['image'],
                        render: ({ open }) =>
                            React.createElement(
                                'div',
                                { className: 'thumbnail-actions' },
                                [
                                    (!hideUploadWhenImageExists || !imageUrl) &&
                                        React.createElement(UploadButton, {
                                            onClick: open,
                                            label: uploadLabel,
                                        }),
                                    React.createElement(RemoveButton, {
                                        visible: !!imageUrl,
                                        onClick: onRemove,
                                        label: removeLabel,
                                    }),
                                ]
                            ),
                    })
                )
            ),
        ]
    );

const MoreButton = ({ href, imgSrc, alt = 'More', className = '' }) => {
    return wp.element.createElement(
        'div',
        { className: `more-button ${className}` },
        wp.element.createElement(
            'a',
            { className: 'more-link', href: href, rel: 'noopener noreferrer' },
            wp.element.createElement('img', {
                className: 'hoverable-icon',
                src: imgSrc,
                alt: alt,
            })
        )
    );
};

const RemoveButtonX = ({ onClick }) =>
    wp.element.createElement(
        'button',
        {
            className: 'remove-x',
            onClick,
            type: 'button',
        },
        wp.element.createElement('img', {
            className: 'remove-x-icon',
            src: `${pluginSettings.pluginUrl}assets/images/delete.svg`,
            alt: 'Delete',
        })
    );

const renderTextLines = (video) => {
    const fields = [
        { value: video.line1, className: 'client-name' },
        { value: video.line2, className: 'production-name' },
        { value: video.line3, className: 'production-name' },
        { value: video.line4, className: 'role-name' },
    ];

    const hasText = fields.some(f => f.value?.trim());
    if (!hasText) return null;

    return React.createElement(
        'div',
        { className: 'hover-text' },
        fields
            .filter(f => f.value?.trim())
            .map((f, i) =>
                React.createElement('p', { className: f.className, key: i }, f.value)
            )
    );
};

registerBlockType('g-block/logo-grid', {
    apiVersion: 3,
    title: 'Logo Grid',
    icon: 'networking',
    category: 'common',
    attributes: {
        logos: {
            type: 'array',
            default: [],
        },
        linkUrl: { type: 'string', default: '' },
        catTitle: { type: 'string', default: '' },
    },

    edit: (props) => {
        const { attributes, setAttributes } = props;
        const blockProps = useBlockProps();
        const { logos } = attributes;
        const { options, currentUrl } = usePagesOptions();
        wp.element.useEffect(() => {
            if (attributes.linkUrl === null && currentUrl) {
                setAttributes({ linkUrl: currentUrl });
            }
        }, [currentUrl]);

        const addLogo = () => {
            const frame = wp.media({
                title: 'Select a Sponsor Logo',
                button: { text: 'Add Logo' },
                multiple: false,
                library: { type: 'image' },
            });

            frame.on('select', () => {
                const img = frame.state().get('selection').first().toJSON();
                const updated = [...logos, { url: img.url, alt: img.alt || '' }];
                setAttributes({ logos: updated });
            });

            frame.open();
        };

        const updateAttr = (key) => (value) => setAttributes({ [key]: value });

        return wp.element.createElement(
            'div',
            blockProps,
            React.createElement( 'h4', { className: 'block-title' }, 'Logo Grid' ),
            React.createElement('div', { className: 'input-fields' }, 
                React.createElement(TextControl, {
                    label: 'Section Title',
                    value: attributes.catTitle,
                    onChange: updateAttr('catTitle')
                }),
                React.createElement(SelectControl, {
                    label: 'Link URL',
                    value: attributes.linkUrl ?? currentUrl,
                    options,
                    onChange: (value) => setAttributes({ linkUrl: value }),
                })
            ),
            wp.element.createElement(
                'div',
                { className: 'logo-row' },
            logos.map((logo, index) =>
                el('div', { key: index, className: 'logo-holder' }, [

                    el(RemoveButtonX, {
                        onClick: () => {
                            const updated = logos.filter((_, i) => i !== index);
                            setAttributes({ logos: updated });
                        }
                    }),

                    el(EditorImageField, {
                        label: `Image ${index + 1}`,
                        imageUrl: logo.url,

                        onSelect: (media) => {
                            const updated = [...logos];
                            updated[index] = {
                                ...updated[index],
                                url: media.url,
                                alt: media.alt,
                            };
                            setAttributes({ logos: updated });
                        },

                        onRemove: () => {
                            const updated = [...logos];
                            updated[index] = { url: '', alt: '' };
                            setAttributes({ logos: updated });
                        },

                        uploadLabel: 'Upload Image',
                        removeLabel: 'Delete Image',
                    })
                ])
            )),
            wp.element.createElement(
                Button,
                { 
                    isPrimary: true, 
                    onClick: addLogo, 
                    className: 'add-logo'
                },
                'Add Element',
            ),
        );
    },

    save: (props) => {
        const { attributes } = props;
        const { logos } = attributes;
    
        return React.createElement(
            'div',
            { className: 'sponsor-logos' },
            (attributes.catTitle?.trim() || attributes.linkUrl) && React.createElement('div', { className: 'title-button-block' },
                    attributes.catTitle?.trim() && React.createElement('h2', { className: 'Section-title' }, attributes.catTitle),
                    attributes.linkUrl && wp.element.createElement(MoreButton, {
                        href: attributes.linkUrl,
                        imgSrc: moreBtnImg,
                        alt: 'More Button',
                    })
            ),
            React.createElement(
                'div',
                { className: 'sponsor-logos-grid' },
                logos.map((logo, index) =>
                    React.createElement(
                        'div',
                        { className: 'sponsor-logo-wrapper', key: index },
                        React.createElement('img', {
                            src: logo.url,
                            alt: logo.alt || '',
                            className: 'sponsor-logo',
                        })
                    )
                )
            )
        );
    }
});

registerBlockType('g-block/photo-text', {
    apiVersion: 3,
    title: 'Photo With Text',
    icon: 'align-left',
    category: 'common',

    attributes: {
        linkUrl: { type: 'string', default: '' },
        catTitle: { type: 'string', default: '' },
        rightText: { type: 'string', default: '' },
        image: { type: 'string', default: '' },
        imagePosition: { type: 'string', default: 'left' }
    },

    edit: function (props) {
        const { attributes, setAttributes } = props;
        const blockProps = useBlockProps();
        const { options, currentUrl } = usePagesOptions();
        wp.element.useEffect(() => {
            if (attributes.linkUrl === null && currentUrl) {
                setAttributes({ linkUrl: currentUrl });
            }
        }, [currentUrl]);

        const updateAttr = (key) => (value) => setAttributes({ [key]: value });

        return React.createElement('div', blockProps,

            React.createElement('h4', { className: 'block-title' }, 'Photo With Text'),

            React.createElement(SelectControl, {
                label: 'Image Position',
                value: attributes.imagePosition,
                options: [
                    { label: 'Left', value: 'left' },
                    { label: 'Right', value: 'right' }
                ],
                onChange: (value) => setAttributes({ imagePosition: value })
            }),

            React.createElement('div', { className: 'video-block' },

                React.createElement('div', { className: 'data-wrapp1' },
                    React.createElement('div', { className: 'input-fields' }, 
                        React.createElement(SelectControl, {
                            label: 'Link URL',
                            value: attributes.linkUrl ?? currentUrl,
                            options,
                            onChange: (value) => setAttributes({ linkUrl: value }),
                        }),
                        React.createElement(TextControl, {
                            label: 'Section Title',
                            value: attributes.catTitle,
                            onChange: updateAttr('catTitle'),
                            __nextHasNoMarginBottom: true
                        }),
                ),

                    React.createElement(TextareaControl, {
                        label: 'Text',
                        value: attributes.rightText,
                        onChange: updateAttr('rightText'),
                        rows: 10,
                        __nextHasNoMarginBottom: true
                    })
                ),

                React.createElement('div', { className: 'data-wrapp2' },
                    React.createElement(EditorImageField, {
                        label: 'Image',
                        imageUrl: attributes.image,
                        onSelect: (media) => setAttributes({ image: media.url }),
                        onRemove: () => setAttributes({ image: '' }),
                        removeLabel: 'Delete Image',
                        className: 'layout-image-field',
                    })
                )
            )
        );
    },

    save: function (props) {
        const { attributes } = props;

        return React.createElement(
            'div',
            {
                className: `photo-text-contact-block ${attributes.imagePosition}`
            },

            React.createElement('div', { className: 'image' },
                attributes.image &&
                React.createElement('img', { src: attributes.image, alt: '' })
            ),

            React.createElement('div', { className: 'content' },
                (attributes.catTitle?.trim() || attributes.linkUrl) && React.createElement('div', { className: 'title-button-block' },
                    attributes.catTitle?.trim() && React.createElement('h2', { className: 'Section-title' }, attributes.catTitle),
                    attributes.linkUrl && wp.element.createElement(MoreButton, {
                        href: attributes.linkUrl,
                        imgSrc: moreBtnImg,
                        alt: 'More Button',
                    })
                ),
                React.createElement('div', {
                    className: 'text-content',
                    dangerouslySetInnerHTML: {
                        __html: attributes.rightText.replace(/\n/g, '<br>')
                    }
                })
            )
        );
    }
});

registerBlockType('g-block/two-photos-title', {
    apiVersion: 3,
    title: '2 Photos + Title (Left / Right)',
    icon: 'format-gallery',
    category: 'common',

    attributes: {
        catTitle: { type: 'string', default: '' },
        image1: { type: 'string', default: '' },
        image2: { type: 'string', default: '' },
        linkUrl: { type: 'string', default: '' },
        source: { type: 'string', default: '' },
        layout: { type: 'string', default: 'left' },
    },

    edit: (props) => {
        const { attributes, setAttributes } = props;
        const blockProps = useBlockProps();
        const { options, currentUrl } = usePagesOptions();
        
        wp.element.useEffect(() => {
            if (attributes.linkUrl === null && currentUrl) {
                setAttributes({ linkUrl: currentUrl });
            }
        }, [currentUrl]);

        const updateAttr = (key) => (value) => setAttributes({ [key]: value });

        return React.createElement(
            'div',
            blockProps,

            React.createElement('h4', { className: 'block-title' }, 'Two Photos + Title (Left / Right)'),

            React.createElement('div', { className: 'input-fields' },

                React.createElement(SelectControl, {
                    label: 'Layout',
                    value: attributes.layout,
                    options: [
                        { label: 'Title left', value: 'left' },
                        { label: 'Title right', value: 'right' },
                    ],
                    onChange: updateAttr('layout'),
                }),

                React.createElement(TextControl, {
                    label: 'Section Title',
                    value: attributes.catTitle,
                    onChange: updateAttr('catTitle'),
                }),

                React.createElement(TextControl, {
                    label: 'Source',
                    value: attributes.source,
                    onChange: updateAttr('source'),
                }),

                React.createElement(SelectControl, {
                    label: 'Link URL',
                    value: attributes.linkUrl ?? currentUrl,
                    options,
                    onChange: (value) => setAttributes({ linkUrl: value }),
                })
            ),

            React.createElement('div', { className: 'photo-blocks-container' },

                React.createElement('div', { className: 'photo1-block' },
                    React.createElement(EditorImageField, {
                        label: 'Left Image',
                        imageUrl: attributes.image1,
                        onSelect: (media) => setAttributes({ image1: media.url }),
                        onRemove: () => setAttributes({ image1: '' }),
                        removeLabel: 'Delete Image',
                    })
                ),

                React.createElement('div', { className: 'photo3-block' },
                    React.createElement(EditorImageField, {
                        label: 'Right Image',
                        imageUrl: attributes.image2,
                        onSelect: (media) => setAttributes({ image2: media.url }),
                        onRemove: () => setAttributes({ image2: '' }),
                        removeLabel: 'Delete Image',
                    })
                )
            )
        );
    },

    save: ({ attributes }) => {
        const isLeft = attributes.layout === 'left';

        const header =
            (attributes.catTitle?.trim() || attributes.linkUrl) && React.createElement( 'div', { className: 'title-button-block' },
                attributes.catTitle?.trim() && React.createElement('h2', { className: 'Section-title' }, attributes.catTitle),
                attributes.linkUrl && wp.element.createElement(MoreButton, {
                    href: attributes.linkUrl,
                    imgSrc: moreBtnImg,
                    alt: 'More Button',
                })
            );

        const sourceOverlay = attributes.source &&
            React.createElement('div', { className: 'hover-text' },
                React.createElement('p', { className: 'source-text' }, attributes.source)
            );

        if (isLeft) {
            return React.createElement(
                'div',
                { className: 'container2photos' },

                React.createElement(
                    'div',
                    { className: 'title-photo-wrapper' },
                    header,
                    React.createElement(
                        'div',
                        { className: 'title-photo lefty' },
                        attributes.image1 &&
                        React.createElement('img', {
                            src: attributes.image1,
                            className: 'photo1left'
                        }),
                        sourceOverlay
                    )
                ),

                React.createElement(
                    'div',
                    { className: 'first-photo' },
                    attributes.image2 &&
                    React.createElement('img', {
                        src: attributes.image2,
                        className: 'photo2left'
                    })
                )
            );
        }

        return React.createElement(
            'div',
            { className: 'container2photos' },

            React.createElement(
                'div',
                { className: 'first-photo' },
                attributes.image1 &&
                React.createElement('img', {
                    src: attributes.image1,
                    className: 'photo1right'
                })
            ),

            React.createElement(
                'div',
                { className: 'title-photo-wrapper' },
                header,
                React.createElement(
                    'div',
                    { className: 'title-photo' },
                    attributes.image2 &&
                    React.createElement('img', {
                        src: attributes.image2,
                        className: 'photo2right'
                    }),
                    sourceOverlay
                )
            )
        );
    }
});

registerBlockType('g-block/popup-photo-block', {
    apiVersion: 3,
    title: '2 Photo Blocks + Pop-Up Title',
    icon: 'format-gallery',
    category: 'common',
    attributes: {
        videos: {
            type: 'array',
            default: [
                {
                    thumbnailUrl: '',
                    line1: '',
                    line2: '',
                    line3: '',
                    line4: '',
                },
                {
                    thumbnailUrl: '',
                    line1: '',
                    line2: '',
                    line3: '',
                    line4: '',
                }
            ],
        },
        catTitle: { type: 'string', default: '' },  
        linkUrl: { type: 'string', default: '' },
    },

    edit: function (props) {
        const { attributes, setAttributes } = props;
        const blockProps = useBlockProps();
        const { videos = [] } = attributes;

        const safeVideos = [...videos];

        while (safeVideos.length < 2) {
            safeVideos.push({
                thumbnailUrl: '',
                line1: '',
                line2: '',
                line3: '',
                line4: '',
            });
        }

        const { options, currentUrl } = usePagesOptions();

        wp.element.useEffect(() => {
            if (attributes.linkUrl === null && currentUrl) {
                setAttributes({ linkUrl: currentUrl });
            }
        }, [currentUrl]);

        const updateVideo = (index, field, value) => {
            const updated = [...safeVideos];
            updated[index][field] = value;
            setAttributes({ videos: updated });
        };

        const resetVideo = (index) => {
            const updated = [...safeVideos];
            updated[index] = {
                thumbnailUrl: '',
                line1: '',
                line2: '',
                line3: '',
                line4: '',
            };
            setAttributes({ videos: updated });
        };

        const updateAttr = (key) => (value) => setAttributes({ [key]: value });

        return React.createElement(
            'div',
            blockProps,

            React.createElement('h4', { className: 'block-title' }, 'Two Photo Blocks & Pop-Up Title'),

            React.createElement(
                'div',
                { className: 'input-fields' },

                React.createElement(TextControl, {
                    label: 'Section Title',
                    value: attributes.catTitle,
                    onChange: updateAttr('catTitle'),
                }),

                React.createElement(SelectControl, {
                    label: 'Link URL',
                    value: attributes.linkUrl ?? currentUrl,
                    options,
                    onChange: (value) => setAttributes({ linkUrl: value }),
                }),
            ),

            React.createElement(
                'div',
                { className: 'video-blocks-container' },

                safeVideos.slice(0, 2).map((video, index) =>
                    React.createElement(
                        'div',
                        { className: 'video-block', key: index },

                        [
                            React.createElement(RemoveButtonX, {
                                onClick: () => resetVideo(index)
                            }),

                            React.createElement(EditorImageField, {
                                label: index === 0 ? 'Left Image' : 'Right Image',
                                imageUrl: video.thumbnailUrl,
                                onSelect: (media) => updateVideo(index, 'thumbnailUrl', media.url),
                                onRemove: () => updateVideo(index, 'thumbnailUrl', ''),
                                className: 'layout-image-field',
                                removeLabel: 'Delete Image',
                            }),

                            React.createElement(TextControl, {
                                label: 'Title Input',
                                value: video.line1,
                                onChange: (value) => updateVideo(index, 'line1', value),
                                __nextHasNoMarginBottom: true
                            }),

                            React.createElement(TextControl, {
                                label: 'Input 1',
                                value: video.line2,
                                onChange: (value) => updateVideo(index, 'line2', value),
                                __nextHasNoMarginBottom: true
                            }),

                            React.createElement(TextControl, {
                                label: 'Input 2',
                                value: video.line3,
                                onChange: (value) => updateVideo(index, 'line3', value),
                                __nextHasNoMarginBottom: true
                            }),

                            React.createElement(TextControl, {
                                label: 'Input 3',
                                value: video.line4,
                                onChange: (value) => updateVideo(index, 'line4', value),
                                __nextHasNoMarginBottom: true
                            })
                        ]
                    )
                )
            )
        );
    },
    

    save: function ({ attributes }) {
        const { videos  } = attributes;
        const blockProps = wp.blockEditor.useBlockProps.save();

    
        return React.createElement(
            'div',
            blockProps,
            [  
                (attributes.catTitle?.trim() || attributes.linkUrl) && React.createElement('div', { className: 'title-button-block' },
                    attributes.catTitle?.trim() && React.createElement('h2', { className: 'Section-title' }, attributes.catTitle),
                        attributes.linkUrl && wp.element.createElement(MoreButton, {
                            href: attributes.linkUrl,
                            imgSrc: moreBtnImg,
                            alt: 'More Button',
                        }) 
                ),
                
                React.createElement(
                    'div',
                    { className: 'video-row', key: 'videos' },
                    videos.map((video, index) => {
                        let videoSrc = '';
    
                        return React.createElement('div', { className: 'photo-popup video-block', key: index }, [
                            React.createElement('div', { className: 'video-thumbnail-container' }, [
                                React.createElement('img', {
                                    src: video.thumbnailUrl,
                                    alt: `Video ${index + 1} Thumbnail`,
                                    className: 'video-thumbnail-clickable',
                                    'data-video-src': videoSrc,
                                }),
                                React.createElement('div', { className: 'hover-text' }, [
                                    React.createElement('p', { className: 'client-name' }, video.line1),
                                    React.createElement('p', { className: 'production-name' }, video.line2),
                                    React.createElement('p', { className: 'production-name' }, video.line3),
                                    React.createElement('p', { className: 'role-name' }, video.line4),
                                ]),
                            ]),
                        ]);
                    })
                )
            ]
        );
    }
    
});

registerBlockType('g-block/photo-name-popup', {
    apiVersion: 3,
    title: 'Masonry Photo Layout - 2 Col',
    icon: 'images-alt',
    category: 'common',
    attributes: {
        videos: {
            type: 'array',
            default: [],
        },
        title: {
            type: 'string',
            default: '', 
        },
        linkUrl: {
            type: 'string',
            default: '',
        },
    },

    edit: function (props) {
        const { attributes, setAttributes } = props;
        const blockProps = useBlockProps();
        const { videos, title } = attributes;
    
        const addVideoBlock = () => {
            const newVideo = {
                thumbnailUrl: '',
                iframeEmbedCode: '',
                line1: '',
                line2: '',
                line3: '',
                line4: '',
            };
            setAttributes({ videos: [...videos, newVideo] });
        };
        const { options, currentUrl } = usePagesOptions();
        wp.element.useEffect(() => {
            if (!attributes.linkUrl && currentUrl) {
                setAttributes({ linkUrl: currentUrl });
            }
        }, [currentUrl]);

        const cols = 2;
        const colsCollection = Array.from({ length: cols }, () => []);

        videos.forEach((video, index) => {
            const targetIndex = index % cols;
            colsCollection[targetIndex].push({ video, index });
        });
    
        const updateVideo = (index, field, value) => {
            const updatedVideos = [...videos];
            updatedVideos[index][field] = value;
            setAttributes({ videos: updatedVideos });
        };

        const updateTitle = (newTitle) => {
            setAttributes({ title: newTitle });
        };
        
    
        return React.createElement(
            'div',
            blockProps,
            React.createElement(
                'h4',
                { className: 'block-title' },
                'Masonry Photo Layout - 2 Col'
            ),
            React.createElement(
                'div',
                { className: 'input-fields' },
                React.createElement(TextControl, {
                    label: 'Section Title',
                    value: title,
                    onChange: updateTitle,
                    __nextHasNoMarginBottom: true
                }),
                React.createElement(SelectControl, {
                    label: 'Link URL',
                    value: attributes.linkUrl,
                    options,
                    onChange: (value) => setAttributes({ linkUrl: value }),
                })
            ),
            React.createElement(
                'div',
                { className: 'video-blocks-container' },
                [
                    colsCollection.map((col, colIndex) =>
                        React.createElement(
                            'div',
                            { className: 'column', key: colIndex },

                            col.map(({ video, index }) =>
                                React.createElement(
                                    'div',
                                    { className: 'video-block', key: index },
                                    [
                                        React.createElement(RemoveButtonX, {
                                            onClick: () => {
                                                const updated = videos.filter((_, i) => i !== index);
                                                setAttributes({ videos: updated });
                                            }
                                        }),
                                        React.createElement( 'div', { className: 'data-wrapp1' },

                                            React.createElement(EditorImageField, {
                                                className: 'video-thumbnail-field',
                                                label: `IMAGE ${index + 1}`,
                                                labelClassName: 'block-label-video',
                                                imageUrl: video.thumbnailUrl,
                                                onSelect: (media) => updateVideo(index, 'thumbnailUrl', media.url),
                                                onRemove: () => updateVideo(index, 'thumbnailUrl', ''),
                                                removeLabel: 'Delete Image',
                                            })

                                        ),

                                        React.createElement ( 'div', { className: 'data-wrapp2' },

                                            React.createElement(TextControl, {
                                                label: 'Title Input',
                                                value: video.line1,
                                                onChange: (value) => updateVideo(index, 'line1', value),
                                                __nextHasNoMarginBottom: true
                                            }),
                                            React.createElement(TextControl, {
                                                label: 'Input 1',
                                                value: video.line2,
                                                onChange: (value) => updateVideo(index, 'line2', value),
                                                __nextHasNoMarginBottom: true
                                            }),
                                            React.createElement(TextControl, {
                                                label: 'Input 2',
                                                value: video.line3,
                                                onChange: (value) => updateVideo(index, 'line3', value),
                                                __nextHasNoMarginBottom: true
                                            }),
                                            React.createElement(TextControl, {
                                                label: 'Input 3',
                                                value: video.line4,
                                                onChange: (value) => updateVideo(index, 'line4', value),
                                                __nextHasNoMarginBottom: true
                                            }),
                                        )
                                    ]
                                )
                            )
                        )
                    )
                ], 
            ),
            React.createElement(
                Button,
                { 
                    isPrimary: true, 
                    onClick: addVideoBlock, 
                    className: 'add-logo' // Custom class added here
                },
                'Add Element',
            ),
        );
    },
    

    save: function ({ attributes }) {
        const { videos } = attributes;
        const cols = 2; // Set to 2 columns now
        const colsCollection = Array.from({ length: cols }, () => []);
    
        videos.forEach((video, index) => {
            const videoBlock = React.createElement(
                'div',
                { className: 'item photo-thumbnail-container', key: index },
                [
                    React.createElement('img', {
                        src: video.thumbnailUrl,
                        alt: `Video ${index + 1} Thumbnail`,
                        className: 'video-thumbnail-clickable',
                        style: { width: '100%', cursor: 'auto' },
                    }),
                    React.createElement('div', { className: 'hover-text' }, [
                        React.createElement('p', { className: 'client-name' }, video.line1),
                        React.createElement('p', { className: 'production-name' }, video.line2),
                        React.createElement('p', { className: 'production-name' }, video.line3),
                        React.createElement('p', { className: 'role-name' }, video.line4),
                    ])
                ]
            );
    
            colsCollection[index % cols].push(videoBlock);
        });
    
        return React.createElement('div', { className: 'video-masonry' },
            (attributes.title?.trim() || attributes.linkUrl) && React.createElement('div', { className: 'title-button-block' },
                attributes.title?.trim() && React.createElement('h2', { className: 'Section-title' }, attributes.title),
                    attributes.linkUrl && wp.element.createElement(MoreButton, {
                        href: attributes.linkUrl,
                        imgSrc: moreBtnImg,
                        alt: 'More Button',
                    })
            ),
            React.createElement('div', { className: 'row' },
                colsCollection.map((col, i) =>
                    React.createElement('div', { className: 'column', key: i }, col)
                )
            )
        );
    }
    
});

registerBlockType('g-block/image-layout-1', {
    apiVersion: 3,
    title: 'Image Layout 1',
    icon: 'images-alt',
    category: 'common',
    attributes: {
        image1: { type: 'string', default: '' },
        image2: { type: 'string', default: '' },
        image3: { type: 'string', default: '' },
        title: {
            type: 'string',
            default: 'Placeholder',
        },
        source: {
            type: 'string',
            default: '', 
        },
        linkUrl: {
            type: 'string',
            default: '',
        },
    },

    edit: (props) => {
        const { attributes, setAttributes } = props;
        const { title, source } = attributes;
        const blockProps = useBlockProps();
        const { options, currentUrl } = usePagesOptions();
        wp.element.useEffect(() => {
            if (!attributes.linkUrl && currentUrl) {
                setAttributes({ linkUrl: currentUrl });
            }
        }, [currentUrl]);

        const updateText = (newText) => {
            setAttributes({ source: newText });
        };
        
        const updateTitle = (newTitle) => {
            setAttributes({ title: newTitle });
        };

        return React.createElement(
            'div',
            blockProps,
            React.createElement('h4', { className: 'block-title' }, 'Image Layout 1'),
            React.createElement(
                'div',
                { className: 'input-fields' },
                React.createElement(TextControl, {
                    label: 'Section Title',
                    value: title,
                    onChange: updateTitle,
                    __nextHasNoMarginBottom: true
                }),
                React.createElement(TextControl, {
                    label: 'Source',
                    value: source,
                    onChange: updateText,
                    __nextHasNoMarginBottom: true
                }),
                React.createElement(SelectControl, {
                    label: 'Link URL',
                    value: attributes.linkUrl,
                    options,
                    onChange: (value) => setAttributes({ linkUrl: value }),
                })
            ),
            React.createElement(
                'div',
                { className: 'photo-blocks-container' },
                [

                    // LEFT IMAGE
                    React.createElement(
                        'div',
                        { className: 'photo1-block', key: 'img1' },
                        React.createElement(EditorImageField, {
                            label: 'Left Image',
                            imageUrl: attributes.image1,
                            onSelect: (media) => setAttributes({ image1: media.url }),
                            onRemove: () => setAttributes({ image1: '' }),
                            removeLabel: 'Delete Image',
                            className: 'layout-image-field',
                        })
                    ),

                    // RIGHT SIDE CONTAINER
                    React.createElement(
                        'div',
                        { className: 'photo-right-container', key: 'right-side' },
                        [

                            // IMAGE 2
                            React.createElement(
                                'div',
                                { className: 'photo2-block', key: 'img2' },
                                React.createElement(EditorImageField, {
                                    label: 'Up-right Image',
                                    imageUrl: attributes.image2,
                                    onSelect: (media) => setAttributes({ image2: media.url }),
                                    onRemove: () => setAttributes({ image2: '' }),
                                    removeLabel: 'Delete Image',
                                    className: 'layout-image-field',
                                })
                            ),

                            // IMAGE 3
                            React.createElement(
                                'div',
                                { className: 'photo3-block', key: 'img3' },
                                React.createElement(EditorImageField, {
                                    label: 'Down-right Image',
                                    imageUrl: attributes.image3,
                                    onSelect: (media) => setAttributes({ image3: media.url }),
                                    onRemove: () => setAttributes({ image3: '' }),
                                    removeLabel: 'Delete Image',
                                    className: 'layout-image-field',
                                })
                            )
                        ]
                    )
                ]
            )
        );
    },

    save: (props) => {
        const { attributes } = props;
        const blockProps = wp.blockEditor.useBlockProps.save();
    
        return React.createElement(
            'div',
            blockProps,
            [
                (attributes.title?.trim() || attributes.linkUrl) && React.createElement('div', { className: 'title-button-block' },
                    attributes.title?.trim() && React.createElement('h2', { className: 'Section-title' }, attributes.title),
                        attributes.linkUrl && wp.element.createElement(MoreButton, {
                            href: attributes.linkUrl,
                            imgSrc: moreBtnImg,
                            alt: 'More Button',
                        })
                ),
                attributes.source?.trim() && React.createElement('p', { className: 'source-text', key: 'source' }, attributes.source),
                React.createElement(
                    'div',
                    { className: 'container3photos', key: 'photos' },
                    [
                        // First image block (image1)
                        React.createElement(
                            'div',
                            { className: 'first-photo-block', key: 'img1' },
                            attributes.image1 &&
                                React.createElement('img', {
                                    src: attributes.image1,
                                    alt: 'Image 1',
                                    className: 'first-photo-left',
                                })
                        ),
    
                        // Second and third images inside another div (container2)
                        React.createElement(
                            'div',
                            { className: 'container2', key: 'img2-3' },
                            [
                                attributes.image2 &&
                                    React.createElement('img', {
                                        src: attributes.image2,
                                        alt: 'Image 2',
                                        className: 'second-photo-right',
                                    }),
                                attributes.image3 &&
                                    React.createElement('img', {
                                        src: attributes.image3,
                                        alt: 'Image 3',
                                        className: 'third-photo-right',
                                    })
                            ]
                        )
                    ]
                )
            ]
        );
    }
    
    
});

registerBlockType('g-block/image-layout-2', {
    apiVersion: 3,
    title: 'Image Layout 2',
    icon: 'images-alt',
    category: 'common',
    attributes: {
        image1: { type: 'string', default: '' },
        image2: { type: 'string', default: '' },
        image3: { type: 'string', default: '' },
        title: {
            type: 'string',
            default: 'Placeholder',
        },
        source: {
            type: 'string',
            default: '',
        },
        linkUrl: {
            type: 'string',
            default: '',
        },
    },

    edit: (props) => {
        const { attributes, setAttributes } = props;
        const { source, title } = attributes;
        const blockProps = useBlockProps();
        const { options, currentUrl } = usePagesOptions();
        wp.element.useEffect(() => {
            if (!attributes.linkUrl && currentUrl) {
                setAttributes({ linkUrl: currentUrl });
            }
        }, [currentUrl]);

        const updateText = (newText) => {
            setAttributes({ source: newText });
        };
        const updateTitle = (newTitle) => {
            setAttributes({ title: newTitle });
        };


        return React.createElement(
            'div',
            blockProps,
            React.createElement('h4', { className: 'block-title' }, 'Image Layout 2'),
            React.createElement(
                'div',
                { className: 'input-fields' },
                React.createElement(TextControl, {
                    label: 'Section Title',
                    value: title,
                    onChange: updateTitle,
                    __nextHasNoMarginBottom: true
                }),
                React.createElement(TextControl, {
                    label: 'Source',
                    value: source,
                    onChange: updateText,
                    __nextHasNoMarginBottom: true
                }),
                React.createElement(SelectControl, {
                    label: 'Link URL',
                    value: attributes.linkUrl,
                    options,
                    onChange: (value) => setAttributes({ linkUrl: value }),
                })
            ),
            React.createElement('div', { className: 'photo-blocks-container' }, 
                React.createElement('div', { className: 'photo1-block' },
                    React.createElement(EditorImageField, {
                        label: 'Left Image',
                        imageUrl: attributes.image1,
                        onSelect: (media) => setAttributes({ image1: media.url }),
                        onRemove: () => setAttributes({ image1: '' }),
                        removeLabel: 'Delete Image',
                        className: 'layout-image-field',
                    })
                ),
                React.createElement('div', { className: 'photo2-block' },
                    React.createElement(EditorImageField, {
                        label: 'Center Image',
                        imageUrl: attributes.image2,
                        onSelect: (media) => setAttributes({ image2: media.url }),
                        onRemove: () => setAttributes({ image2: '' }),
                        removeLabel: 'Delete Image',
                        className: 'layout-image-field',
                    })
                ),
                React.createElement('div', { className: 'photo3-block' },
                    React.createElement(EditorImageField, {
                        label: 'Right Image',
                        imageUrl: attributes.image3,
                        onSelect: (media) => setAttributes({ image3: media.url }),
                        onRemove: () => setAttributes({ image3: '' }),
                        removeLabel: 'Delete Image',
                        className: 'layout-image-field',
                    })
                ),
            ),
        );
    },

    save: (props) => {
        const { attributes } = props;
        const blockProps = wp.blockEditor.useBlockProps.save();

        return React.createElement(
            'div',
            { ...blockProps },
            [
                (attributes.title?.trim() || attributes.linkUrl) && React.createElement('div', { className: 'title-button-block' },
                    attributes.title?.trim() && React.createElement('h2', { className: 'Section-title' }, attributes.title),
                        attributes.linkUrl && wp.element.createElement(MoreButton, {
                            href: attributes.linkUrl,
                            imgSrc: moreBtnImg,
                            alt: 'More Button',
                        })
                ),
                attributes.source?.trim() && React.createElement('p', { className: 'source-text', key: 'source' }, attributes.source),
                React.createElement(
                    'div',
                    { className: 'container-photos' },
                    [
                        attributes.image1 &&
                        React.createElement(
                            'div',
                            { className: 'img-wrapper', key: 'img1' },
                            React.createElement('img', {
                                src: attributes.image1,
                                alt: 'Image 1',
                            })
                        ),
                        attributes.image2 &&
                        React.createElement(
                            'div',
                            { className: 'img-wrapper', key: 'img2' },
                            React.createElement('img', {
                                src: attributes.image2,
                                alt: 'Image 2',
                            })
                        ),
                        attributes.image3 &&
                        React.createElement(
                            'div',
                            { className: 'img-wrapper', key: 'img3' },
                            React.createElement('img', {
                                src: attributes.image3,
                                alt: 'Image 3',
                            })
                        )
                    ]),
            ]
            
        );
    }    
});

registerBlockType('g-block/fullscreen-video', {
    apiVersion: 3,    
    title: '2 Horizontal Videos',
    icon: 'image-flip-horizontal',
    category: 'common',
    attributes: {
        videos: {
            type: 'array',
            default: [],
        },
        title: {
            type: 'string',
            default: '',
        },
        linkUrl: {
            type: 'string',
            default: '', // fallback link
        },
    },

    edit: function (props) {
        const { attributes, setAttributes } = props;
        const blockProps = useBlockProps();
        const { videos, title } = attributes;
    
        const addVideoBlock = () => {
            const newVideo = {
                thumbnailUrl: '',
                iframeEmbedCode: '',
                line1: '',
                line2: '',
                line3: '',
                line4: '',
            };
            setAttributes({ videos: [...videos, newVideo] });
        };
        const { options, currentUrl } = usePagesOptions();
        wp.element.useEffect(() => {
            if (!attributes.linkUrl && currentUrl) {
                setAttributes({ linkUrl: currentUrl });
            }
        }, [currentUrl]);
    
        const updateVideo = (index, field, value) => {
            const updatedVideos = [...videos];
            updatedVideos[index][field] = value;
            setAttributes({ videos: updatedVideos });
        };

        const updateTitle = (newTitle) => {
            setAttributes({ title: newTitle });
        };
    
        return React.createElement(
            'div',
            blockProps,
            React.createElement(
                'h4',
                { className: 'block-title' },
                'Two Horizontal Videos'
            ),
            React.createElement(
                'div',
                { className: 'input-fields' },
                React.createElement(TextControl, {
                    label: 'Section Title',
                    value: title,
                    onChange: updateTitle,
                    __nextHasNoMarginBottom: true
                }),
                React.createElement(SelectControl, {
                    label: 'Link URL',
                    value: attributes.linkUrl,
                    options,
                    onChange: (value) => setAttributes({ linkUrl: value }),
                })
            ),
            
            React.createElement(
                'div',
                { className: 'video-blocks-container' },
                [
                    videos.map((video, index) => {
                        return React.createElement('div', { className: 'video-block' }, [
                        React.createElement(RemoveButtonX, {
                            onClick: () => {
                                const updated = videos.filter((_, i) => i !== index);
                                setAttributes({ videos: updated });
                            }
                        }),
                        React.createElement(
                            'div',
                            { className: 'data-wrapp1' },

                            //1. iframe label
                            React.createElement(TextareaControl, {
                                className:'text-area',
                                label: `Video embed`,
                                help: 'Paste the iframe embed code from YouTube or Vimeo.',
                                value: video.iframeEmbedCode,
                                onChange: (value) => updateVideo(index, 'iframeEmbedCode', value),
                                rows: 3
                            }),

                            React.createElement(EditorImageField, {
                                className: 'video-thumbnail-field',
                                label: `IMAGE ${index + 1}`,
                                labelClassName: 'block-label-video',
                                imageUrl: video.thumbnailUrl,
                                onSelect: (media) => updateVideo(index, 'thumbnailUrl', media.url),
                                onRemove: () => updateVideo(index, 'thumbnailUrl', ''),
                                removeLabel: 'Delete Image',
                            })

                        ),

                            React.createElement ( 'div', { className: 'data-wrapp2' },

                                React.createElement(TextControl, {
                                    label: 'Title Input',
                                    value: video.line1,
                                    onChange: (value) => updateVideo(index, 'line1', value),
                                    __nextHasNoMarginBottom: true
                                }),
                                React.createElement(TextControl, {
                                    label: 'Input 1',
                                    value: video.line2,
                                    onChange: (value) => updateVideo(index, 'line2', value),
                                    __nextHasNoMarginBottom: true
                                }),
                                React.createElement(TextControl, {
                                    label: 'Input 2',
                                    value: video.line3,
                                    onChange: (value) => updateVideo(index, 'line3', value),
                                    __nextHasNoMarginBottom: true
                                }),
                                React.createElement(TextControl, {
                                    label: 'Input 3',
                                    value: video.line4,
                                    onChange: (value) => updateVideo(index, 'line4', value),
                                    __nextHasNoMarginBottom: true
                                }),
                            )
                        ]);
                    }),
                ], 
            ),
            videos.length < 2 &&
                React.createElement(
                    Button,
                    { 
                        isPrimary: true, 
                        onClick: addVideoBlock, 
                        className: 'add-logo' // Custom class added here
                    },
                    'Add Video',
                ),
        );
    },
    

    save: function ({ attributes }) {
        const { videos } = attributes;
        const blockProps = wp.blockEditor.useBlockProps.save();
    
        return React.createElement(
            'div',
            blockProps,
            [  
                
                (attributes.title?.trim() || attributes.linkUrl) && React.createElement('div', { className: 'title-button-block' },
                    attributes.title?.trim() && React.createElement('h2', { className: 'Section-title' }, attributes.title),
                        attributes.linkUrl && wp.element.createElement(MoreButton, {
                            href: attributes.linkUrl,
                            imgSrc: moreBtnImg,
                            alt: 'More Button',
                        })
                ),
                
                React.createElement(
                    'div',
                    { className: 'video-row', key: 'videos' },
                    videos.map((video, index) => {
                        let videoSrc = '';
                        const match = video.iframeEmbedCode && video.iframeEmbedCode.match(/src=["']([^"']+)["']/);
                        if (match) {
                            videoSrc = match[1];
                        }
    
                        return React.createElement('div', { className: 'video-block', key: index }, [
                            React.createElement('div', { className: 'video-thumbnail-container' }, [
                                React.createElement('img', {
                                    src: video.thumbnailUrl,
                                    alt: `Video ${index + 1} Thumbnail`,
                                    className: 'video-thumbnail-clickable',
                                    style: { width: '100%', cursor: 'pointer' },
                                    'data-video-src': videoSrc,
                                }),
                                React.createElement('div', { className: 'hover-text' }, [
                                    React.createElement('p', { className: 'client-name' }, video.line1),
                                    React.createElement('p', { className: 'production-name' }, video.line2),
                                    React.createElement('p', { className: 'production-name' }, video.line3),
                                    React.createElement('p', { className: 'role-name' }, video.line4),
                                ]),
                            ]),
                        ]);
                    })
                )
            ]
        );
    }   
});

registerBlockType('g-block/fullscreen-video-1', {
    apiVersion: 3,
    title: '2 Videos + Title (Left / Right',
    icon: 'image-flip-horizontal',
    category: 'common',
    attributes: {
        videos: {
            type: 'array',
            default: [],
        },
        title: {
            type: 'string',
            default: '',  // Default title
        },
        linkUrl: {
            type: 'string',
            default: '', // fallback link
        },
        layout: {
            type: 'string',
            default: 'left',
        },
    },

    edit: function (props) {
        const { attributes, setAttributes } = props;
        const { videos, title, layout } = attributes;
        const blockProps = useBlockProps();

        const { options, currentUrl } = usePagesOptions();

        wp.element.useEffect(() => {
            if (!attributes.linkUrl && currentUrl) {
                setAttributes({ linkUrl: currentUrl });
            }
        }, [currentUrl]);

        const updateAttr = (key) => (value) => setAttributes({ [key]: value });

        const updateVideo = (index, field, value) => {
            const updated = [...videos];
            updated[index][field] = value;
            setAttributes({ videos: updated });
        };

        const addVideoBlock = () => {
            if (videos.length >= 2) return;

            const newVideo = {
                thumbnailUrl: '',
                iframeEmbedCode: '',
                line1: '',
                line2: '',
                line3: '',
                line4: '',
            };

            setAttributes({ videos: [...videos, newVideo] });
        };

        const removeVideo = (index) => {
            const updated = videos.filter((_, i) => i !== index);
            setAttributes({ videos: updated });
        };

        return React.createElement(
            'div',
            blockProps,

            React.createElement('h4', { className: 'block-title' }, 'Two Videos + Title (Left / Right)'),

            React.createElement('div', { className: 'input-fields' },

                React.createElement(SelectControl, {
                    label: 'Layout',
                    value: layout,
                    options: [
                        { label: 'Title left', value: 'left' },
                        { label: 'Title right', value: 'right' },
                    ],
                    onChange: updateAttr('layout'),
                }),

                React.createElement(TextControl, {
                    label: 'Section Title',
                    value: title,
                    onChange: updateAttr('title'),
                }),

                React.createElement(SelectControl, {
                    label: 'Link URL',
                    value: attributes.linkUrl ?? currentUrl,
                    options,
                    onChange: (value) => setAttributes({ linkUrl: value }),
                })
            ),

            React.createElement(
                'div',
                { className: 'video-blocks-container' },

                videos.map((video, index) =>
                    React.createElement(
                        'div',
                        { className: 'video-block', key: index },

                        React.createElement(RemoveButtonX, {
                            onClick: () => removeVideo(index)
                        }),

                        React.createElement('div', { className: 'data-wrapp1' },

                            React.createElement(TextareaControl, {
                                className: 'text-area',
                                label: `Video embed ${index + 1}`,
                                value: video.iframeEmbedCode,
                                onChange: (value) => updateVideo(index, 'iframeEmbedCode', value),
                                rows: 3,
                            }),

                            React.createElement(EditorImageField, {
                                label: 'Thumbnail',
                                imageUrl: video.thumbnailUrl,
                                onSelect: (media) => updateVideo(index, 'thumbnailUrl', media.url),
                                onRemove: () => updateVideo(index, 'thumbnailUrl', ''),
                                removeLabel: 'Delete Image'
                            })
                        ),

                        React.createElement('div', { className: 'data-wrapp2' },

                            React.createElement(TextControl, {
                                label: 'Title Input',
                                value: video.line1,
                                onChange: (value) => updateVideo(index, 'line1', value),
                            }),
                            React.createElement(TextControl, {
                                label: 'Input 1',
                                value: video.line2,
                                onChange: (value) => updateVideo(index, 'line2', value),
                            }),
                            React.createElement(TextControl, {
                                label: 'Input 2',
                                value: video.line3,
                                onChange: (value) => updateVideo(index, 'line3', value),
                            }),
                            React.createElement(TextControl, {
                                label: 'Input 3',
                                value: video.line4,
                                onChange: (value) => updateVideo(index, 'line4', value),
                            })
                        )
                    )
                )
            ),

            videos.length < 2 &&
                React.createElement(
                    Button,
                    {
                        isPrimary: true,
                        onClick: addVideoBlock,
                        className: 'add-logo'
                    },
                    'Add Video'
                )
        );
    },
    

    save: function ({ attributes }) {
        const { videos, title, linkUrl, layout } = attributes;
        const blockProps = wp.blockEditor.useBlockProps.save();

        const isLeft = layout === 'left';

        const header =
            (title?.trim() || linkUrl) &&
            React.createElement('div', { className: 'title-button-block' },
                title?.trim() &&
                    React.createElement('h2', { className: 'Section-title' }, title),
                linkUrl &&
                    wp.element.createElement(MoreButton, {
                        href: linkUrl,
                        imgSrc: moreBtnImg,
                        alt: 'More Button',
                    })
            );

        const renderVideo = (video, index, imgClass = '') => {
            let videoSrc = '';
            const match = video.iframeEmbedCode?.match(/src=["']([^"']+)["']/);
            if (match) videoSrc = match[1];

            const hasText = video.line1 || video.line2 || video.line3 || video.line4;

            return React.createElement(
                'div',
                { className: 'video-thumbnail-container' },
                [
                    React.createElement('img', {
                        src: video.thumbnailUrl,
                        alt: `Video ${index + 1}`,
                        className: `video-thumbnail-clickable ${imgClass}`,
                        'data-video-src': videoSrc,
                    }),

                    hasText &&
                        React.createElement('div', { className: 'hover-text' }, [
                            video.line1 && React.createElement('p', { className: 'client-name' }, video.line1),
                            video.line2 && React.createElement('p', { className: 'production-name' }, video.line2),
                            video.line3 && React.createElement('p', { className: 'production-name' }, video.line3),
                            video.line4 && React.createElement('p', { className: 'role-name' }, video.line4),
                        ]),
                ]
            );
        };

        return React.createElement(
            'div',
            blockProps, // ✅ vedno na root

            React.createElement(
                'div',
                { className: 'container2photos' }, // ✅ TVOJ WRAPPER

                isLeft
                    ? [
                        // LEFT layout
                        React.createElement(
                            'div',
                            { className: 'title-photo-wrapper', key: 'left' },
                            [
                                header,
                                React.createElement(
                                    'div',
                                    { className: 'title-photo' },
                                    videos[0] && renderVideo(videos[0], 0, 'photo1left')
                                )
                            ]
                        ),

                        React.createElement(
                            'div',
                            { className: 'first-photo', key: 'right' },
                            videos[1] && renderVideo(videos[1], 1, 'photo2left')
                        )
                    ]
                    : [
                        // RIGHT layout
                        React.createElement(
                            'div',
                            { className: 'first-photo', key: 'left' },
                            videos[0] && renderVideo(videos[0], 0, 'photo1right')
                        ),

                        React.createElement(
                            'div',
                            { className: 'title-photo-wrapper', key: 'right' },
                            [
                                header,
                                React.createElement(
                                    'div',
                                    { className: 'title-photo' },
                                    videos[1] && renderVideo(videos[1], 1, 'photo2right')
                                )
                            ]
                        )
                    ]
            )
        );
    }
    
});

registerBlockType('g-block/fullscreen-video-tworow', {
    apiVersion: 3,
    title: 'Masonry Video Layout - 2 Col',
    icon: 'video-alt3',
    category: 'common',
    attributes: {
        videos: {
            type: 'array',
            default: [],
        },
        title: {
            type: 'string',
            default: 'Sample-page',
        },
        linkUrl: {
            type: 'string',
            default: '',
        },
    },

    edit: function (props) {
        const { attributes, setAttributes } = props;
        const blockProps = useBlockProps();
        const { videos, title } = attributes;

        const { options, currentUrl } = usePagesOptions();
        wp.element.useEffect(() => {
            if (!attributes.linkUrl && currentUrl) {
                setAttributes({ linkUrl: currentUrl });
            }
        }, [currentUrl]);

        const cols = 2;
        const colsCollection = Array.from({ length: cols }, () => []);

        videos.forEach((video, index) => {
            const targetIndex = index % cols;
            colsCollection[targetIndex].push({ video, index });
        });
    
        const addVideoBlock = () => {
            const newVideo = {
                thumbnailUrl: '',
                iframeEmbedCode: '',
                line1: '',
                line2: '',
                line3: '',
                line4: '',
                columnIndex: null
            };
            setAttributes({ videos: [...videos, newVideo] });
        };
    
        const updateVideo = (index, field, value) => {
            const updatedVideos = [...videos];
            updatedVideos[index][field] = value;
            setAttributes({ videos: updatedVideos });
        };

        const updateTitle = (newTitle) => {
            setAttributes({ title: newTitle });
        };
        
        return React.createElement(
            'div',
            blockProps,
            React.createElement(
                'h4',
                { className: 'block-title' },
                'Masonry Video Layout - 2 Col'
            ),
            React.createElement(
                'div',
                { className: 'input-fields' },
                React.createElement(TextControl, {
                    label: 'Section Title',
                    value: title,
                    onChange: updateTitle,
                    __nextHasNoMarginBottom: true
                }),
                React.createElement(SelectControl, {
                    label: 'Link URL',
                    value: attributes.linkUrl,
                    options,
                    onChange: (value) => setAttributes({ linkUrl: value }),
                })
            ),

            

            React.createElement(
                'div',
                { className: 'video-blocks-container' },
                [
                    colsCollection.map((col, colIndex) =>
                        React.createElement(
                            'div',
                            { className: 'column', key: colIndex },

                            col.map(({ video, index }) =>
                                React.createElement(
                                    'div',
                                    { className: 'video-block', key: index },
                                    [
                                        React.createElement(RemoveButtonX, {
                                            onClick: () => {
                                                const updated = videos.filter((_, i) => i !== index);
                                                setAttributes({ videos: updated });
                                            }
                                        }),
                                        React.createElement( 'div', { className: 'data-wrapp1' },

                                            React.createElement(EditorImageField, {
                                                className: 'video-thumbnail-field',
                                                label: `IMAGE ${index + 1}`,
                                                labelClassName: 'block-label-video',
                                                imageUrl: video.thumbnailUrl,
                                                onSelect: (media) => updateVideo(index, 'thumbnailUrl', media.url),
                                                onRemove: () => updateVideo(index, 'thumbnailUrl', ''),
                                                removeLabel: 'Delete Image',
                                            })

                                        ),

                                        React.createElement ( 'div', { className: 'data-wrapp2' },

                                            React.createElement(TextareaControl, {
                                                className:'text-area',
                                                label: `Video embed`,
                                                help: 'Paste the iframe embed code from YouTube or Vimeo.',
                                                value: video.iframeEmbedCode,
                                                onChange: (value) => updateVideo(index, 'iframeEmbedCode', value),
                                                rows: 3
                                            }),

                                            React.createElement(TextControl, {
                                                label: 'Title Input',
                                                value: video.line1,
                                                onChange: (value) => updateVideo(index, 'line1', value),
                                                __nextHasNoMarginBottom: true
                                            }),
                                            React.createElement(TextControl, {
                                                label: 'Input 1',
                                                value: video.line2,
                                                onChange: (value) => updateVideo(index, 'line2', value),
                                                __nextHasNoMarginBottom: true
                                            }),
                                            React.createElement(TextControl, {
                                                label: 'Input 2',
                                                value: video.line3,
                                                onChange: (value) => updateVideo(index, 'line3', value),
                                                __nextHasNoMarginBottom: true
                                            }),
                                            React.createElement(TextControl, {
                                                label: 'Input 3',
                                                value: video.line4,
                                                onChange: (value) => updateVideo(index, 'line4', value),
                                                __nextHasNoMarginBottom: true
                                            }),
                                        )
                                    ]
                                )
                            )
                        )
                    )
                ], 
            ),
            React.createElement(
                Button,
                { 
                    isPrimary: true, 
                    onClick: addVideoBlock, 
                    className: 'add-logo'
                },
                'Add Video',
            ),
        );
    },

    

    save: function ({ attributes }) {
        const { videos } = attributes;
        const cols = 2;
        const colsCollection = Array.from({ length: cols }, () => []);
    
        videos.forEach((video, index) => {
            const match = video.iframeEmbedCode && video.iframeEmbedCode.match(/src=["']([^"']+)["']/);
            const videoSrc = match ? match[1] : '';
    
            const videoBlock = React.createElement(
                'div',
                { className: 'item video-thumbnail-container', key: index },
                [
                    React.createElement('img', {
                        src: video.thumbnailUrl,
                        alt: `Video ${index + 1} Thumbnail`,
                        className: 'video-thumbnail-clickable',
                        style: { width: '100%', cursor: 'pointer' },
                        'data-video-src': videoSrc,
                    }),
                    React.createElement('div', { className: 'hover-text' }, [
                        React.createElement('p', { className: 'client-name' }, video.line1),
                        React.createElement('p', { className: 'production-name' }, video.line2),
                        React.createElement('p', { className: 'production-name' }, video.line3),
                        React.createElement('p', { className: 'role-name' }, video.line4),
                    ])
                ]
            );
    
            colsCollection[index % cols].push(videoBlock);
        });
    
        return React.createElement('div', { className: 'video-masonry' },
            (attributes.title?.trim() || attributes.linkUrl) && React.createElement('div', { className: 'title-button-block' },
                    attributes.title?.trim() && React.createElement('h2', { className: 'Section-title' }, attributes.title),
                    attributes.linkUrl &&
                        wp.element.createElement(MoreButton, {
                            href: attributes.linkUrl,
                            imgSrc: moreBtnImg,
                            alt: 'More Button',
                        })
                ),
            React.createElement('div', { className: 'row' },
                colsCollection.map((col, i) =>
                    React.createElement('div', { className: 'column', key: i }, col)
                )
            )
        );
    }
    
});

registerBlockType('g-block/fullscreen-video-masonry', {
    apiVersion: 3,
    title: 'Masonry Video Layout - 3 columns',
    icon: 'video-alt3',
    category: 'common',
    attributes: {
        videos: {
            type: 'array',
            default: [],
        },

        title: {
            type: 'string',
            default: '',  // Default title
        },
        linkUrl: {
            type: 'string',
            default: '',
        },
    },

    edit: function (props) {
        const { attributes, setAttributes } = props;
        const blockProps = useBlockProps();
        const { videos, title } = attributes;
        const cols = 3;
        const colsCollection = Array.from({ length: cols }, () => []);

        const addVideoBlock = () => {
            const newVideo = {
                thumbnailUrl: '',
                iframeEmbedCode: '',
                line1: '',
                line2: '',
                line3: '',
                line4: '',
                columnIndex: null,
            };

            setAttributes({ videos: [...videos, newVideo] });
        };

        const updateVideo = (index, field, value) => {
            const updatedVideos = [...videos];
            updatedVideos[index][field] = value;
            setAttributes({ videos: updatedVideos });
        };

        const updateTitle = (newTitle) => {
            setAttributes({ title: newTitle });
        };

        const { options, currentUrl } = usePagesOptions();

        wp.element.useEffect(() => {
            if (!attributes.linkUrl && currentUrl) {
                setAttributes({ linkUrl: currentUrl });
            }
        }, [currentUrl]);

        videos.forEach((video, index) => {
            const videoBlock = React.createElement(
                'div',
                {
                    className: 'video-block',
                    key: index
                },
                [
                    React.createElement(RemoveButtonX, {
                        onClick: () => {
                            const updated = videos.filter((_, i) => i !== index);
                            setAttributes({ videos: updated });
                        }
                    }),

                    React.createElement(
                        'div',
                        { className: 'data-wrapp1' },

                        React.createElement(EditorImageField, {
                            className: 'video-thumbnail-field',
                            label: `IMAGE ${index + 1}`,
                            labelClassName: 'block-label-video',
                            imageUrl: video.thumbnailUrl,
                            onSelect: (media) => updateVideo(index, 'thumbnailUrl', media.url),
                            onRemove: () => updateVideo(index, 'thumbnailUrl', ''),
                            removeLabel: 'Delete Image',
                        })
                    ),

                    React.createElement(
                        'div',
                        { className: 'data-wrapp2' },

                        React.createElement(TextareaControl, {
                            className: 'text-area',
                            label: 'Video embed',
                            help: 'Paste the iframe embed code from YouTube or Vimeo.',
                            value: video.iframeEmbedCode,
                            onChange: (value) => updateVideo(index, 'iframeEmbedCode', value),
                            rows: 3
                        }),

                        React.createElement(TextControl, {
                            label: 'Title Input',
                            value: video.line1,
                            onChange: (value) => updateVideo(index, 'line1', value),
                            __nextHasNoMarginBottom: true
                        }),

                        React.createElement(TextControl, {
                            label: 'Input 1',
                            value: video.line2,
                            onChange: (value) => updateVideo(index, 'line2', value),
                            __nextHasNoMarginBottom: true
                        }),

                        React.createElement(TextControl, {
                            label: 'Input 2',
                            value: video.line3,
                            onChange: (value) => updateVideo(index, 'line3', value),
                            __nextHasNoMarginBottom: true
                        }),

                        React.createElement(TextControl, {
                            label: 'Input 3',
                            value: video.line4,
                            onChange: (value) => updateVideo(index, 'line4', value),
                            __nextHasNoMarginBottom: true
                        }),
                        React.createElement(SelectControl, {
                            label: 'Column',
                            help: 'Choose in which column the video should appear.',
                            value:
                                video.columnIndex !== null &&
                                video.columnIndex !== undefined
                                    ? video.columnIndex
                                    : '',
                            options: [
                                { label: 'Auto', value: '' },
                                { label: 'Column 1', value: 0 },
                                { label: 'Column 2', value: 1 },
                                { label: 'Column 3', value: 2 },
                            ],
                            onChange: (value) =>
                                updateVideo(
                                    index,
                                    'columnIndex',
                                    value === '' ? null : parseInt(value, 10)
                                ),
                        })
                    )
                ]
            );

            const targetIndex =
                typeof video.columnIndex === 'number' &&
                video.columnIndex >= 0 &&
                video.columnIndex < cols
                    ? video.columnIndex
                    : index % cols;

            colsCollection[targetIndex].push(videoBlock);
        });

        return React.createElement(
            'div',
            blockProps,

            React.createElement(
                'h4',
                { className: 'block-title' },
                'Masonry Video Layout - 3 Col'
            ),

            React.createElement(
                'div',
                { className: 'input-fields' },
                React.createElement(TextControl, {
                    label: 'Section Title',
                    value: title,
                    onChange: updateTitle,
                    __nextHasNoMarginBottom: true
                }),
                React.createElement(SelectControl, {
                    label: 'Link URL',
                    value: attributes.linkUrl,
                    options,
                    onChange: (value) => setAttributes({ linkUrl: value }),
                })
            ),

            React.createElement(
                'div',
                { className: 'video-blocks-container' },
                colsCollection.map((colItems, colIndex) =>
                    React.createElement(
                        'div',
                        { className: 'column', key: colIndex },
                        colItems
                    )
                )
            ),

            React.createElement(
                Button,
                {
                    isPrimary: true,
                    onClick: addVideoBlock,
                    className: 'add-logo'
                },
                'Add Video'
            )
        );
    },


    save: function ({ attributes }) {
        const { videos } = attributes;
        const cols = 3; // Number of columns
        const colsCollection = Array.from({ length: cols }, () => []);
        
        videos.forEach((video, index) => {
            const match = video.iframeEmbedCode && video.iframeEmbedCode.match(/src=["']([^"']+)["']/);
            const videoSrc = match ? match[1] : '';
    
            const videoBlock = wp.element.createElement('div', { className: 'item video-thumbnail-container', key: index }, [
                wp.element.createElement('img', {
                    src: video.thumbnailUrl,
                    alt: `Video ${index + 1} Thumbnail`,
                    className: 'video-thumbnail-clickable',
                    style: { width: '100%', cursor: 'pointer' },
                    'data-video-src': videoSrc,
                }),
                wp.element.createElement('div', { className: 'hover-text' }, [
                    wp.element.createElement('p', { className: 'client-name' }, video.line1),
                    wp.element.createElement('p', { className: 'production-name' }, video.line2),
                    wp.element.createElement('p', { className: 'production-name' }, video.line3),
                    wp.element.createElement('p', { className: 'role-name' }, video.line4),
                ])
            ]);
    
            // Assign to the right column
            const targetIndex = 
                typeof video.columnIndex === 'number' && video.columnIndex >= 0 && video.columnIndex < cols
                    ? video.columnIndex
                    : index % cols;
    
            colsCollection[targetIndex].push(videoBlock);
        });
    
        return wp.element.createElement('div', { className: 'video-masonry' },

            (attributes.title?.trim() || attributes.linkUrl) && React.createElement('div', { className: 'title-button-block' },
                    attributes.title?.trim() && React.createElement('h2', { className: 'Section-title' }, attributes.title),
                    attributes.linkUrl &&
                        wp.element.createElement(MoreButton, {
                            href: attributes.linkUrl,
                            imgSrc: moreBtnImg,
                            alt: 'More Button',
                        })
                ),

            wp.element.createElement('div', { className: 'row' },
                colsCollection.map((colItems, colIndex) =>
                    wp.element.createElement('div', { className: 'column', key: colIndex }, colItems)
                )
            )
        );
    }
});











