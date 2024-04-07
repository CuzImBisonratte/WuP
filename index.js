// Config
const config = {
    src: {
        components_dir: 'src/components', // The directory where the components are stored (like header, footer, etc.)
        static: {
            copy: true, // Copy the src/static directory to the output directory
            use_components: true // Use the modules in the src/components directory
        },
        errors: {
            copy: true, // Copy the src/errors directory to the output directory
            use_components: true, // Use the modules in the src/components directory
            generate_htaccess: true // Generate a .htaccess file for the error pages
        }
    },
    build: {
        output_dir: 'build',
        articles_dir: 'build/articles', // The directory where the articles will be output
        index: {
            copy: true, // Use the src/index.html file as the output index.html
            use_components: true, // Use the modules in the src/components directory
        }
    }
};

// Modules
const showdown = require('showdown');
const fs = require('fs');
const path = require('path');

const converter = new showdown.Converter({
    simpleLineBreaks: true,
    metadata: true,
    openLinksInNewWindow: true,
    strikethrough: true,
    tables: true,
    tasklists: true,
    underline: true
});

// Create output directory
if (fs.existsSync(config.build.output_dir)) fs.rmSync(config.build.output_dir, { recursive: true });
if (!fs.existsSync(config.build.output_dir)) fs.mkdirSync(config.build.output_dir);

// Copy /res to build/res recursively
fs.cpSync("res", "build/res", { recursive: true });

// Function to copy components to the output directory
function component_replacer(content, article = "") {
    const components = fs.readdirSync(config.src.components_dir);
    components.forEach(component => {
        const component_path = path.join(config.src.components_dir, component);
        const component_content = fs.readFileSync(component_path, { encoding: 'utf-8' });
        const component_name = path.basename(component, path.extname(component));
        content = content.replace(new RegExp(`{${component_name}}`, 'g'), component_content);
    });
    content = content.replace("{content}", article);
    return content;
}

// 
// Index page
// 
if (config.build.index.copy) {
    const index_content = fs.readFileSync("src/index.html", { encoding: 'utf-8' });
    var index_output = config.build.index.use_components ? component_replacer(index_content) : index_content;
    index_output = index_output.replace("navbutton-activate-home", "navbutton_active");
    fs.writeFileSync(path.join(config.build.output_dir, "index.html"), index_output);
}

// 
// Articles
// 
const articles = fs.readdirSync("articles");
articles.forEach(article => {
    const article_content = fs.readFileSync(path.join("articles", article), { encoding: "utf-8" });

    // Convert article content to HTML
    const article_content_converted = converter.makeHtml(article_content);
    const article_attributes = converter.getMetadata();
    const article_html = component_replacer(fs.readFileSync(path.join(config.src.components_dir, "article.html"), { encoding: 'utf-8' }), article_content_converted);

    // Generate article output path
    if (!article_attributes.url) {
        console.error(`Article ${article} does not have a URL attribute.`);
        exit(1);
    }
    const article_output_path = path.join(config.build.output_dir, article_attributes.url, "index.html");

    // Generate article output
    // 
    // Because of unknown behavior of showdown (GH-Issue:#1004) sometimes ampersands are html-encoded and sometimes they aren't, therefore we have to check for already encoded ampersands
    var article_output = article_html.replace(/[äöüÄÖÜß€$&§@](?!amp;)/g, match => {
        switch (match) {
            case 'ä':
                return '&auml;';
            case 'ö':
                return '&ouml;';
            case 'ü':
                return '&uuml;';
            case 'Ä':
                return '&Auml;';
            case 'Ö':
                return '&Ouml;';
            case 'Ü':
                return '&Uuml;';
            case 'ß':
                return '&szlig;';
            case '€':
                return '&euro;';
            case '$':
                return '&dollar;';
            case '&':
                return '&amp;';
            case '§':
                return '&sect;';
            case '@':
                return '&commat;';
            default:
                return match;
        }
    });

    // Choose right navigation item
    if (article_attributes.active_nav) article_output = article_output.replace("navbutton-activate-" + article_attributes.active_nav, "navbutton_active");

    // Insert custom CSS
    if (article_attributes.custom_css) article_output = article_output.replace("<!--customcss-->", `<style>${article_attributes.custom_css}</style>`);

    fs.mkdirSync(path.dirname(article_output_path), { recursive: true });
    fs.writeFileSync(article_output_path, article_output);
});

// 
// Static files
// 
if (config.src.static.copy) {
    const static_files = fs.readdirSync("src/static", { encoding: 'utf-8' });
    static_files.forEach(file => {
        // Load file content and generate output paths and content
        const file_path = path.join("src/static", file);
        const file_output_path = path.join(config.build.output_dir, file.replace(".html", ""), "index.html");
        const file_content = fs.readFileSync(file_path, { encoding: 'utf-8' });
        var file_output = config.src.static.use_components ? component_replacer(file_content) : file_content;

        // Search the output for navbutton: tags and activate them
        if (file_output.includes("<!-- navbutton: ")) {
            const navbutton_name = file_output.match(/<!-- navbutton: (.*) -->/)[1];
            file_output = file_output.replace("navbutton-activate-" + navbutton_name, "navbutton_active");
        }

        // Write file to output directory
        fs.mkdirSync(path.dirname(file_output_path), { recursive: true });
        fs.writeFileSync(file_output_path, file_output);
    });
}

// 
// Error pages
//

if (config.src.errors.copy) {
    fs.mkdirSync(path.join(config.build.output_dir, "errors"), { recursive: true });
    const errors = fs.readdirSync("src/errors", { encoding: 'utf-8' });
    var error_codes = [];
    errors.forEach(error => {
        const error_content = fs.readFileSync(path.join("src/errors", error), { encoding: 'utf-8' });
        const error_output = config.src.errors.use_components ? component_replacer(error_content) : error_content;
        const error_output_path = path.join(config.build.output_dir, "errors", error);
        fs.writeFileSync(error_output_path, error_output);
        error_codes.push(error.replace(".html", ""));
    });
    var htaccess_content = "RewriteEngine On\nRewriteBase /\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\n";
    error_codes.forEach(code => {
        htaccess_content += `RewriteRule (.*) /errors/${code}.html [L,R=404]\n`;
        htaccess_content += `ErrorDocument ${code} /errors/${code}.html\n`;
    });
    fs.writeFileSync(path.join(config.build.output_dir, ".htaccess"), htaccess_content);
}