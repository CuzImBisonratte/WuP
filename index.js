// Config
const config = {
    src: {
        components_dir: 'src/components', // The directory where the components are stored (like header, footer, etc.)
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
const front_matter = require('front-matter');

const converter = new showdown.Converter({ simpleLineBreaks: true });

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
    if (config.build.index.use_components) fs.writeFileSync(path.join(config.build.output_dir, "index.html"), component_replacer(index_content));
    else fs.writeFileSync(path.join(config.build.output_dir, "index.html"), index_content);
}

// 
// Articles
// 
const articles = fs.readdirSync("articles");
articles.forEach(article => {
    const article_path = path.join("articles", article);
    const article_data = front_matter(fs.readFileSync(article_path, { encoding: 'utf-8' }));
    const article_content = article_data.body;
    const article_attributes = article_data.attributes;

    // Convert article content to HTML
    const article_content_converted = converter.makeHtml(article_content);
    const article_html = component_replacer(fs.readFileSync(path.join(config.src.components_dir, "article.html"), { encoding: 'utf-8' }), article_content_converted);

    // Generate article output path
    if (!article_attributes.url) {
        console.error(`Article ${article} does not have a URL attribute.`);
        exit(1);
    }
    const article_output_path = path.join(config.build.output_dir, article_attributes.url, "index.html");

    // Generate article output
    var article_output = article_html.replace(/[äöüÄÖÜß€$&§@]/g, match => {
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

    fs.mkdirSync(path.dirname(article_output_path), { recursive: true });
    fs.writeFileSync(article_output_path, article_output);
});