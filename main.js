var total_bytes = 0;
var images_bytes = 0;
var css_bytes = 0;
var js_bytes = 0;
var html_bytes = 0;
var font_bytes = 0;

$(".input-website").focus();

$(document).on("submit", "#website-form", function(e) {
    e.preventDefault();

    var website = $(".input-website").val();

    get_full_html(website);
});

function get_size_html(url, object_is) {
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
                        total_bytes = total_bytes + parseInt(_kb);

                        if(object_is.image) {
                            images_bytes = images_bytes + parseInt(_kb);
                        } else if(object_is.css) {
                            css_bytes = css_bytes + parseInt(_kb);
                        } else if(object_is.html) {
                            html_bytes = html_bytes + parseInt(_kb);
                        } else if(object_is.js) {
                            js_bytes = js_bytes + parseInt(_kb);
                        } else if(object_is.font) {
                            font_bytes = font_bytes + parseInt(_kb);
                        }
                        console.log("");
                        console.log("Image:", formatBytes(images_bytes, 3));
                        console.log("Html:", formatBytes(html_bytes, 3));
                        console.log("CSS:", formatBytes(css_bytes, 3));
                        console.log("JS:", formatBytes(js_bytes, 3));
                        console.log("Font:", formatBytes(font_bytes, 3));
                        console.log("Total:", formatBytes(total_bytes,3));
                    }
                });
            } else {
                //console.log(url, kb);
                total_bytes = total_bytes + parseInt(kb);

                if(object_is.image) {
                    images_bytes = images_bytes + parseInt(kb);
                } else if(object_is.css) {
                    css_bytes = css_bytes + parseInt(kb);
                } else if(object_is.html) {
                    html_bytes = html_bytes + parseInt(kb);
                } else if(object_is.js) {
                    js_bytes = js_bytes + parseInt(kb);
                } else if(object_is.font) {
                    font_bytes = font_bytes + parseInt(kb);
                }
                console.log("");
                console.log("Image:", formatBytes(images_bytes, 3));
                console.log("Html:", formatBytes(html_bytes, 3));
                console.log("CSS:", formatBytes(css_bytes, 3));
                console.log("JS:", formatBytes(js_bytes, 3));
                console.log("Font:", formatBytes(font_bytes, 3));
                console.log("Total:", formatBytes(total_bytes,3));
            }
        }
    });
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
            get_size_html(href, object_is);

            get_external_from_css(href, url);
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

                if(display_none_test.indexOf("display:none") > -1 || display_none_test.indexOf("display: none") > -1) {
                    continue;
                }

                if(new_link.substring(0, 1) == "\"" || new_link.substring(0, 1) == "'") {
                    new_link = new_link.substring(1);
                    new_link = new_link.substring(0, new_link.length - 1);
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
