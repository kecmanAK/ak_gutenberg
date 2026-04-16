<?php
/**
 * Plugin Name: AK Gutenberg Custom Blocks
 * Description: UX-focused Gutenberg blocks that help non-technical WordPress editors publish rich layouts without developer support.
 * Version: 2.0.0
 * Requires at least: 6.4
 * Requires PHP: 7.4
 * Author: AK
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: ak-gutenberg-custom-blocks
 * Domain Path: /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; 
}

function gutenberg_block_plugin_enqueue_assets() {

    wp_register_script(
        'g-blocks',
        plugin_dir_url( __FILE__ ) . 'blocks.js',
        array( 'wp-blocks', 'wp-block-editor', 'wp-editor', 'wp-components', 'wp-element' ),
        filemtime( plugin_dir_path( __FILE__ ) . 'blocks.js' )
    );

    wp_add_inline_script(
        'g-blocks',
        'const pluginSettings = ' . wp_json_encode([
            'pluginUrl' => plugin_dir_url(__FILE__),
        ]),
        'before'
    );


    wp_register_style(
        'g-blocks-editor-style',
        plugin_dir_url( __FILE__ ) . 'editor.css',
        array( 'wp-edit-blocks' ),
        filemtime( plugin_dir_path( __FILE__ ) . 'editor.css' )
    );

    wp_register_style(
        'g-blocks-style',
        plugin_dir_url( __FILE__ ) . 'style.css',
        array(),
        filemtime( plugin_dir_path( __FILE__ ) . 'style.css' )
    );

    wp_register_style(
        'g-blocks-style-new',
        plugin_dir_url( __FILE__ ) . 'style-new.css',
        array(),
        filemtime( plugin_dir_path( __FILE__ ) . 'style-new.css' )
    );
    wp_enqueue_style('g-blocks-style-new');

    

    // Register blocks.

    register_block_type( 'g-block/logo-grid', array(
        'editor_script' => 'g-blocks',
        'editor_style'  => 'g-blocks-editor-style',
        'style'         => 'g-blocks-style',
    ) );

    register_block_type( 'g-block/fullscreen-video', array(
        'editor_script' => 'g-blocks',
        'editor_style'  => 'g-blocks-editor-style',
        'style'         => 'g-blocks-style',
    ) );

    register_block_type( 'g-block/two-photos-title', array(
        'editor_script' => 'g-blocks',
        'editor_style'  => 'g-blocks-editor-style',
        'style'         => 'g-blocks-style',
    ) );

    register_block_type( 'g-block/popup-photo-block', array(
        'editor_script' => 'g-blocks',
        'editor_style'  => 'g-blocks-editor-style',
        'style'         => 'g-blocks-style',
    ) );

    register_block_type( 'g-block/fullscreen-video-1', array(
        'editor_script' => 'g-blocks',
        'editor_style'  => 'g-blocks-editor-style',
        'style'         => 'g-blocks-style',
    ) );

    register_block_type( 'g-block/fullscreen-video-masonry', array(
        'editor_script' => 'g-blocks',
        'editor_style'  => 'g-blocks-editor-style',
        'style'         => 'g-blocks-style',
    ) );

    register_block_type( 'g-block/fullscreen-video-tworow', array(
        'editor_script' => 'g-blocks',
        'editor_style'  => 'g-blocks-editor-style',
        'style'         => 'g-blocks-style',
    ) );

    register_block_type( 'g-block/photo-name-popup', array(
        'editor_script' => 'g-blocks',
        'editor_style'  => 'g-blocks-editor-style',
        'style'         => 'g-blocks-style',
    ) );

    register_block_type( 'g-block/image-layout-1', array(
        'editor_script' => 'g-blocks',
        'editor_style'  => 'g-blocks-editor-style',
        'style'         => 'g-blocks-style',
    ) );

    register_block_type( 'g-block/image-layout-2', array(
        'editor_script' => 'g-blocks',
        'editor_style'  => 'g-blocks-editor-style',
        'style'         => 'g-blocks-style',
    ) );

    register_block_type( 'g-block/photo-text', array(
        'editor_script' => 'g-blocks',
        'editor_style'  => 'g-blocks-editor-style',
        'style'         => 'g-blocks-style',
    ) );

    wp_register_script(
        'ag-fullscreen-video-frontend',
        plugins_url( 'frontend.js', __FILE__ ),
        array(),
        filemtime( plugin_dir_path( __FILE__ ) . 'frontend.js' )
    );

    wp_enqueue_script( 'ag-fullscreen-video-frontend' );
    
}
add_action( 'init', 'gutenberg_block_plugin_enqueue_assets' );
