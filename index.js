// Config
const config = {
    src: {
        components_dir: 'src/components', // The directory where the components are stored (like header, footer, etc.),
        icons_dir: 'res/images/icons', // The directory where the icons are stored
        static: {
            copy: true, // Copy the src/static directory to the output directory
            use_components: true // Use the modules in the src/components directory
        },
        errors: {
            copy: true, // Copy the src/errors directory to the output directory
            use_components: true // Use the modules in the src/components directory
        },
        htaccess: {
            copy: false, // Copy the src/.htaccess file to the output directory
            generate_error_rewrites: true, // Generate error rewrites for the .htaccess file
        },
        admin: {
            enable: true, // Copy the src/admin directory to the output directory
            use_components: true, // Use the modules in the src/components directory
            path: '/admin', // The path where the admin panel is located,
            password: '' // The password for the admin panel
        }
    },
    build: {
        output_dir: 'build',
        articles_dir: 'build/articles', // The directory where the articles will be output
        index: {
            copy: true, // Use the src/index.html file as the output index.html
            use_components: true, // Use the modules in the src/components directory
        },
        downloads: {
            base_dir: '/downloads', // The base directory where the downloads are stored relative to /res
            generate_pages: true, // Generate download listing pages
            generate_empty_php_page: true, // Generate an empty download-page for PHP generation (Admin-Panel)
            list: [ // List of downloads to generate pages for
                {
                    dir_location: 'coronahilfen',
                    title: 'Corona-Hilfen',
                    url: "/corona-hilfen"
                },
                {
                    dir_location: 'mandanteninfo',
                    title: 'Mandanten-Informationen',
                    url: "/mandanteninformationen"
                }
            ]
        }
    },
    dynamic: {
        contactForm: {
            enable: true,
            recipient: '',
            subject: 'Kontaktformular',
            url: '/kontakt',
            success_page: 'erfolg',
            sender: {
                name: 'Wissler & Protzen',
                credentials: {
                    mail: '',
                    host: '',
                    username: '',
                    password: '',
                    port: 465,
                }
            }
        }
    }
};

// Modules
const showdown = require('showdown');
const php_pass_hash = require('node-php-password');
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
    // HTML-Component replacer
    const components = fs.readdirSync(config.src.components_dir);
    components.forEach(component => {
        const component_path = path.join(config.src.components_dir, component);
        const component_content = fs.readFileSync(component_path, { encoding: 'utf-8' });
        const component_name = path.basename(component, path.extname(component));
        content = content.replace(new RegExp(`{${component_name}}`, 'g'), component_content);
    });
    content = content.replace("{content}", article);
    // SVG-Icon replacer
    const icons = fs.readdirSync(config.src.icons_dir);
    icons.forEach(icon => {
        if (path.extname(icon) != ".svg") return;
        const icon_name = path.basename(icon, path.extname(icon));
        content = content.replace(new RegExp(`\\[icon:${icon_name}\\]`, 'g'), fs.readFileSync(path.join("res/images/icons", icon), { encoding: 'utf-8' }));
    });
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

    // Choose right navbar item
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

var error_codes = [];
if (config.src.errors.copy) {
    fs.mkdirSync(path.join(config.build.output_dir, "errors"), { recursive: true });
    const errors = fs.readdirSync("src/errors", { encoding: 'utf-8' });
    errors.forEach(error => {
        const error_content = fs.readFileSync(path.join("src/errors", error), { encoding: 'utf-8' });
        const error_output = config.src.errors.use_components ? component_replacer(error_content) : error_content;
        const error_output_path = path.join(config.build.output_dir, "errors", error);
        fs.writeFileSync(error_output_path, error_output);
        error_codes.push(error.replace(".html", ""));
    });
}

// 
// Generate .htaccess file
//
var htaccess_content = "";
if (config.src.htaccess.copy) htaccess_content = fs.readFileSync("src/.htaccess", { encoding: 'utf-8' });
if (config.src.htaccess.generate_error_rewrites) {
    htaccess_content += "RewriteEngine On\nRewriteBase /\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\n";
    error_codes.forEach(code => {
        if (code == "404") htaccess_content += `RewriteRule (.*) /errors/${code}.html [L,R=${code}]\n`;
        htaccess_content += `ErrorDocument ${code} /errors/${code}.html\n`;
    });
}
htaccess_content += "RewriteRule ^admin/res/ - [F,L]\n";
fs.writeFileSync(path.join(config.build.output_dir, ".htaccess"), htaccess_content);

//
// Downloads
//
if (config.build.downloads.generate_pages) {
    config.build.downloads.list.forEach(download => {
        const download_dir = path.join("res", config.build.downloads.base_dir, download.dir_location);
        const download_files = fs.readdirSync(download_dir, { encoding: 'utf-8' }).reverse();
        // Create html
        var output_content = fs.readFileSync(path.join(config.src.components_dir, "downloads.html"), { encoding: 'utf-8' });
        output_content = component_replacer(output_content);
        output_content = output_content.replace("{download_title}", download.title);
        // Create download list
        var download_list = "";
        download_files.forEach(file => {
            const file_path = path.join(download_dir, file);
            const file_name = path.basename(file, path.extname(file)).replace(/_/g, " ").replace(/-/g, "/");
            download_list += `<div class="download-item">`;
            download_list += `<a href="/res${config.build.downloads.base_dir}/${download.dir_location}/${file}" download="${file}">`;
            download_list += `<h2>${file_name}</h2>`;
            download_list += `<img src="/res/images/icons/download.svg" alt="Download" />`;
            download_list += `</a></div>`;
            if (file != download_files[download_files.length - 1]) download_list += "<hr>";
        });
        output_content = output_content.replace("{download_list}", download_list);
        // Search the output for navbutton: tags and activate them
        if (output_content.includes("<!-- navbutton: ")) {
            const navbutton_name = output_content.match(/<!-- navbutton: (.*) -->/)[1];
            output_content = output_content.replace("navbutton-activate-" + navbutton_name, "navbutton_active");
        }
        // Generate output
        const output_dir = path.join(config.build.output_dir, download.url);
        fs.mkdirSync(output_dir, { recursive: true });
        fs.writeFileSync(path.join(output_dir, "index.html"), output_content);
    });
}
if (config.build.downloads.generate_empty_php_page) {
    const empty_php = fs.readFileSync(config.src.components_dir + "/downloads.html", { encoding: 'utf-8' })
        .replace("{download_title}", "?DOWNLOAD_TITLE?")
        .replace("{download_list}", "?DOWNLOAD_LIST?");
    fs.mkdirSync(path.join(config.build.output_dir, "/admin/res"), { recursive: true });
    fs.writeFileSync(path.join(config.build.output_dir, "/admin/res/downloads.html"), component_replacer(empty_php));
}

// 
// Admin
//
if (config.src.admin.enable) {
    const admin_dir = path.join(config.build.output_dir, config.src.admin.path);
    fs.mkdirSync(admin_dir, { recursive: true });
    const pages = fs.readdirSync("src/admin", { encoding: 'utf-8' });
    if (config.src.admin.password == "") console.error("\x1b[31m%s\x1b[0m", "No admin password set in config.");
    const hashed_password = php_pass_hash.hash(config.src.admin.password);
    pages.forEach(page => {
        const page_content = fs.readFileSync(path.join("src/admin", page), { encoding: 'utf-8' });
        const page_output = (config.src.admin.use_components ? component_replacer(page_content) : page_content)
            .replace("{ADMIN_PASSWORD}", hashed_password)
            .replace("{DOWNLOADS}", JSON.stringify(config.build.downloads.list));
        fs.writeFileSync(path.join(admin_dir, page), page_output);
    });
}

// 
// Kontaktformular
// 
if (config.dynamic.contactForm.enable) {
    // contact form
    const contact_form = fs.readFileSync("src/contact/kontakt.html", { encoding: 'utf-8' });
    var output_content = component_replacer(contact_form);
    if (output_content.includes("<!-- navbutton: ")) {
        const navbutton_name = output_content.match(/<!-- navbutton: (.*) -->/)[1];
        output_content = output_content.replace("navbutton-activate-" + navbutton_name, "navbutton_active");
    }
    const contact_form_output_path = path.join(config.build.output_dir, config.dynamic.contactForm.url, "index.html");
    fs.mkdirSync(path.dirname(contact_form_output_path), { recursive: true });
    fs.writeFileSync(contact_form_output_path, output_content);
    // success page
    const success_page = fs.readFileSync("src/contact/success.html", { encoding: 'utf-8' });
    var success_output = component_replacer(success_page);
    if (success_output.includes("<!-- navbutton: ")) {
        const navbutton_name = success_output.match(/<!-- navbutton: (.*) -->/)[1];
        success_output = success_output.replace("navbutton-activate-" + navbutton_name, "navbutton_active");
    }
    const success_output_path = path.join(config.build.output_dir, config.dynamic.contactForm.url, config.dynamic.contactForm.success_page + ".html");
    fs.writeFileSync(success_output_path, success_output);
    // sendMail.php
    var sendMail_output = fs.readFileSync("src/contact/sendMail.php", { encoding: 'utf-8' })
        .replace("{sender_data}", JSON.stringify(config.dynamic.contactForm.sender))
        .replace("{recipient}", config.dynamic.contactForm.recipient)
        .replace("{success_url}", config.dynamic.contactForm.url + "/" + config.dynamic.contactForm.success_page + ".html");
    const sendMail_output_path = path.join(config.build.output_dir, config.dynamic.contactForm.url, "sendMail.php");
    fs.writeFileSync(sendMail_output_path, sendMail_output);
}