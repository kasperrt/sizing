var total_bytes = 0;
var images_bytes = 0;
var css_bytes = 0;
var js_bytes = 0;
var html_bytes = 0;
var font_bytes = 0;
var visited = [];
var full_css = "";
var full_html = "";
var fonts = {};
var css_links = [];
var html_links = [];
var image_links = [];
var font_links = [];
var js_links = [];
var started = false;

$(".input-website").focus();

$(document).on("submit", "#website-form", function(e) {
    e.preventDefault();
    started = true;
    var website = $(".input-website").val();

    if(!website.endsWith("/")) website = website + "/";

    total_bytes = 0;
    images_bytes = 0;
    css_bytes = 0;
    js_bytes = 0;
    html_bytes = 0;
    font_bytes = 0;
    visited = [];
    js_links = [];
    image_links = [];
    html_links = [];
    css_links = [];
    font_links = [];
    full_css = "";
    full_html = "";
    fonts = {};

    get_full_html(website);
});

$(document).on("mouseenter", ".bar div", function(e){
    if(started) {
        $(".explanation-container").empty();
        $(".explanation-container").removeClass("hide");
        var position = $(this).position();
        var width = $(this).width();
        var height = $(this).height();
        var top = position.top + height;
        var left = position.left;


        var text_content = [];
        var element = $(this).attr("class");
        if(element == "js") {
            text_content = js_links;
        } else if(element == "html") {
            text_content = html_links;
        } else if(element == "css") {
            text_content = css_links;
        } else if(element == "font") {
            text_content = font_links;
        } else if(element == "image") {
            text_content = image_links;
        }

        for(var i = 0; i < text_content.length; i++) {
            $(".explanation-container").append("<a target='_blank' href='" + text_content[i] + "'>" + text_content[i] + "</a>");
        }

        if(left + $(".explanation-container").width() > $(window).width()) {
            left = $(window).width() - $(".explanation-container").width();
        }

        $(".explanation-container").css('top', top);
        $(".explanation-container").css('left', left);
    }
});


$(document).on("mousemove", ".bar div", function(e) {
    var position = $(this).position();
    var width = $(this).width();
    var height = $(this).height();
    var top = position.top + height;
    var left = e.pageX - $(".explanation-container").width() / 2;

    if(left + $(".explanation-container").width() > $(window).width()) {
        left = $(window).width() - $(".explanation-container").width();
    } else if(left < 0) {
        left = 0;
    }

    $(".explanation-container").css('top', top);
    $(".explanation-container").css('left', left);
});

$(document).on("mouseleave", ".bar div", function(e) {
    var related = $(e.relatedTarget);
    if(related.hasClass("explanation-container")) return;
    if(!$(".explanation-container").hasClass("hide")) {
        $(".explanation-container").addClass("hide")
    }
});

$(document).on("mouseleave", ".explanation-container", function(e) {
    var related = $(e.relatedTarget);
    if(related.hasClass("image")) return;
    if(!$(".explanation-container").hasClass("hide")) {
        $(".explanation-container").addClass("hide")
    }
})

function get_size_html(url, object_is, next, args) {
    if(visited.indexOf(url) > -1) return;
    visited.push(url);
    var xhr = $.ajax({
        type: "HEAD",
        url: "http://127.0.0.1:8080/" + url,
        cache: false,
        "cf-cache": false,
        success: function(msg){
            var bytes = xhr.getResponseHeader('Content-Length');
            var kb = bytes;

            if(bytes == undefined) {
                $.ajax({
                    type: "GET",
                    url: "http://127.0.0.1:8080/" + url,
                    success: function(response){
                        var _kb = encodeURI(response).split(/%..|./).length - 1;
                        //console.log(url, _kb);

                        handle_responses(_kb, url, object_is, next, args);
                    }
                });
            } else {
                handle_responses(kb, url, object_is, next, args);
            }
        }
    });
}

function handle_responses(kb, url, object_is, next, args) {
    //console.log(url, kb);
    if(object_is.image) {
        images_bytes = images_bytes + parseInt(kb);
        image_links.push(url);
    } else if(object_is.css) {
        css_bytes = css_bytes + parseInt(kb);
        css_links.push(url);
    } else if(object_is.html) {
        html_bytes = html_bytes + parseInt(kb);
        html_links.push(url);
    } else if(object_is.js) {
        js_bytes = js_bytes + parseInt(kb);
        js_links.push(url);
    } else if(object_is.font) {
        var font_name = url.substring(url.lastIndexOf("/") + 1);
        if(font_name.endsWith("woff2") && fonts.hasOwnProperty(font_name.substring(0, font_name.length - 1))) {
            var woff = font_name.substring(0, font_name.length - 1);
            font_bytes = font_bytes - fonts[woff];
            total_bytes = total_bytes - fonts[woff];
            delete fonts[woff];
            var delete_url = url.substring(0, url.length -1);
            var index_delete = font_links.indexOf(delete_url);

            if(index_delete > -1) {
                font_links.splice(index_delete, 1);
            }
        } else if(font_name.endsWith("woff2") && fonts.hasOwnProperty(font_name.substring(0, font_name.length - 5) + "eot")) {
            var eot = font_name.substring(0, font_name.length - 5) + "eot";
            font_bytes = font_bytes - fonts[eot];
            total_bytes = total_bytes - fonts[eot];
            delete fonts[eot];

            var delete_url = url.substring(0, url.length - 5) + "eot";
            var index_delete = font_links.indexOf(delete_url);
            if(index_delete > -1) {
                font_links.splice(index_delete, 1);
            }
        } else if(font_name.endsWith("woff2") && fonts.hasOwnProperty(font_name.substring(0, font_name.length - 5) + "ttf")) {
            var ttf = font_name.substring(0, font_name.length - 5) + "ttf";
            font_bytes = font_bytes - fonts[ttf];
            total_bytes = total_bytes - fonts[ttf];
            delete fonts[ttf];

            var delete_url = url.substring(0, url.length - 5) + "ttf";
            var index_delete = font_links.indexOf(delete_url);
            if(index_delete > -1) {
                font_links.splice(index_delete, 1);
            }
        } else if(font_name.endsWith("woff") && fonts.hasOwnProperty(font_name + "2")) {
            return;
        } else if((font_name.endsWith("eot") || font_name.endsWith("ttf")) && fonts.hasOwnProperty(font_name.substring(0, font_name.length - 3) + "woff2")) {
            return;
        }

        font_links.push(url);

        fonts[font_name] = kb;
        font_bytes = font_bytes + parseInt(kb);
    }

    total_bytes = total_bytes + parseInt(kb);

    change_sizes();

    if(typeof(next) == "function") {
        next(args[0], args[1]);
    }
}

function change_sizes() {
    $(".html").width(html_bytes / total_bytes * 100 + "%");
    $(".css").width(css_bytes / total_bytes * 100 + "%");
    $(".js").width(js_bytes / total_bytes * 100 + "%");
    $(".font").width(font_bytes / total_bytes * 100 + "%");
    $(".image").width(images_bytes / total_bytes * 100 + "%");

    $(".font-size").text(formatBytes(font_bytes, 3));
    $(".html-size").text(formatBytes(html_bytes, 3));
    $(".css-size").text(formatBytes(css_bytes, 3));
    $(".image-size").text(formatBytes(images_bytes, 3));
    $(".js-size").text(formatBytes(js_bytes, 3));
    $(".total-size").text(formatBytes(total_bytes, 3));
}

function get_full_html(url) {
    var object_is = {
        font: false,
        image: false,
        css: false,
        js: false,
        html: true,
    }

    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:8080/" + url,
        success: function(response){
            full_html = response;
            get_size_html(url, object_is);
            get_size_css(url, response);
            get_size_images(url, response);
            get_size_js(url, response);
        },
    });
}

function get_size_css(url, response) {
    var y = $("<div>" + response + "</div>");
    var links = $(y.find("link"));

    var object_is = {
        font: false,
        image: false,
        css: true,
        js: false,
        html: false,
    }

    $.each(links, function(i, data) {
        var link_data = $(data)[0].outerHTML;
        var d = $(data)[0];
        d = $(d);

        if(link_data.indexOf(".css") > -1 || link_data.indexOf("text/css") > -1 || link_data.indexOf("stylesheet") > -1) {
            var href = d.attr("href");
            if(href.substring(0,2) == "//") {
                href = "http:" + href;
            }
            var absolute = relativeOrAbsolute(href);
            if(!absolute) {
                if(href.startsWith("/")) {
                    href = get_root_url(url) + href;
                } else {
                    href = url + href;
                }
            }
            get_size_html(href, object_is, get_external_from_css, [href, url]);
        }
    });
}

function get_external_from_css(url, original_url) {
    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:8080/" + url,
        success: function(response) {
            var regex = /url\(/gi, result, indices = [];
            while ( (result = regex.exec(response)) ) {
                indices.push(result.index);
            }
            for(var i = 0; i < indices.length; i++) {
                var is_font = false;
                var is_image = false;
                var is_css = false;
                var last_index;
                var parent_url = url;
                var prev = 1;
                var curr_place = response.substring(indices[i]);
                var last_curly = response.substring(0, indices[i]);
                var last_curly_index = last_curly.lastIndexOf("{");
                var last_curly_next_index = response.substring(last_curly_index).indexOf("}");

                var display_none_test = response.substring(last_curly_index, last_curly_index + last_curly_next_index + 1);

                var next_par = curr_place.indexOf(")");
                var new_link = curr_place.substring(4, next_par);
                var index_q = new_link.indexOf("?");
                if(index_q > -1) {
                    new_link = new_link.substring(0, index_q);
                }

                if(display_none_test.indexOf("display:none") > -1 || display_none_test.indexOf("display: none") > -1) {
                    continue;
                }

                if(new_link.substring(0, 1) == "\"" || new_link.substring(0, 1) == "'") {
                    new_link = new_link.substring(1);
                    if(new_link.endsWith("\"") || new_link.endsWith("'")) {
                        new_link = new_link.substring(0, new_link.length - 1);
                    }
                }

                if(new_link.indexOf(".eot") > -1 || new_link.indexOf(".woff") > -1 || new_link.indexOf(".ttf") > -1) {
                    is_font = true;
                } else if(new_link.indexOf(".jpg") > -1 || new_link.indexOf(".jpeg") > -1 || new_link.indexOf(".png") > -1 || new_link.indexOf(".gif") > -1 || new_link.indexOf(".svg") > -1) {
                    is_image = true;
                } else if(new_link.indexOf(".css") > -1) {
                    is_css = true;
                }

                var object_is = {
                    font: is_font,
                    image: is_image,
                    css: is_css,
                    js: false,
                    html: false,
                }

                if(is_font) {
                    display_none_test = display_none_test.replace(/\s/g,'');
                    var font_family_index = display_none_test.indexOf("font-family") + 1;
                    var sub = display_none_test.substring(font_family_index);
                    var end_index = sub.indexOf(";");
                    var font_family = display_none_test.substring(font_family_index + 12, end_index + 1);
                    var response_class = response.substring(0, last_curly_index);
                    var _class = response_class.lastIndexOf(".");
                    var new_sub = response_class.substring(_class);

                    if(occurrences(response, font_family) < 2 && occurrences(full_css, font_family) < 2) {
                        continue;
                    }
                } else if(is_image) {
                    var response_class = response.substring(0, last_curly_index);
                    var _class = response_class.lastIndexOf(".");
                    var new_sub = response_class.substring(_class);

                    if(new_sub.indexOf("#") > -1) {
                        var response_class = response.substring(0, last_curly_index);
                        var _id = response_class.lastIndexOf("#");
                        var new_sub = response_class.substring(_id);

                        if(occurrences(full_html, new_sub.substring(1) < 1)) {
                            continue;
                        }
                    } else {
                        if(occurrences(full_html, new_sub.substring(1) < 1)) {
                            continue;
                        }
                    }
                }

                if(new_link.startsWith("..")) {
                    parent_url = parent_url.substring(0, parent_url.lastIndexOf("/"));
                    parent_url = parent_url.substring(0, parent_url.lastIndexOf("/"));
                    new_link = new_link.substring(2);
                    get_size_html(parent_url + new_link, object_is);
                    continue;
                } else if(new_link.startsWith(".")) {
                    parent_url = parent_url.substring(0, parent_url.lastIndexOf("/"));
                    new_link = new_link.substring(2);
                    get_size_html(parent_url + new_link, object_is);
                    continue;
                } else if(new_link.startsWith("http")) {
                    get_size_html(new_link, object_is);
                    continue;
                } else if(new_link.startsWith("/")) {
                    if(!new_link.startsWith("/")) {
                        new_link = "/" + new_link;
                    }
                    original_url = get_root_url(original_url);
                    get_size_html(original_url + new_link, object_is);
                    continue;
                } else if(!new_link.startsWith("data")){
                    parent_url = parent_url.substring(0, parent_url.lastIndexOf("/"));
                    if(!new_link.startsWith("/")) {
                        new_link = "/" + new_link;
                    }

                    get_size_html(parent_url + new_link, object_is);
                    continue;
                } else {
                    //console.log(new_link);
                }
            }
        }
    });
}

function occurrences(string, subString, allowOverlapping) {

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}

function get_root_url(url) {
    var index = 0;
    if(url.startsWith("https://")) {
        index = 8;
    } else {
        index = 7;
    }
    var indexOf = url.substring(index);

    var indexOfNum = indexOf.indexOf("/");
    if(indexOfNum == -1) return url;
    return url.substring(0, indexOfNum + index);
}

function get_size_js(url, response) {
    var y = $("<div>" + response + "</div>");
    var links = $(y.find("script"));

    var object_is = {
        font: false,
        image: false,
        css: false,
        js: true,
        html: false,
    }

    $.each(links, function(i, data) {
        var link_data = $(data)[0].outerHTML;
        var d = $(data)[0];
        d = $(d);


        var src = d.attr("src");
        if(src == undefined) return;
        if(src.substring(0,2) == "//") {
            src = "http:" + src;
        }

        var absolute = relativeOrAbsolute(src);
        if(!absolute) {
            if(src.startsWith("/")) {
                src = get_root_url(url) + src;
            } else {
                src = url + src;
            }
        }

        get_size_html(src, object_is);
    });
}

function get_size_images(url, response) {
    var y = $("<div>" + response + "</div>");
    var links = $(y.find("img"));

    var object_is = {
        font: false,
        image: true,
        css: false,
        js: false,
        html: false,
    }

    $.each(links, function(i, data) {
        var link_data = $(data)[0].outerHTML;
        var d = $(data)[0];
        d = $(d);


        var src = d.attr("src");
        if(src.substring(0,2) == "//") {
            src = "http:" + src;
        }

        var absolute = relativeOrAbsolute(src);
        if(!absolute) {
            if(src.startsWith("/")) {
                src = get_root_url(url) + src;
            } else {
                src = url + src;
            }
        }
        get_size_html(src, object_is);
    });
}

function relativeOrAbsolute(urlString) {
    var pat = /^https?:\/\//i;
    if (pat.test(urlString)) {
        return true;
    }
    return false;
}

function formatBytes(a,b){if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}
