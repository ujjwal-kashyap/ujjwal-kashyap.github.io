// --------------- definitions ---------------
let page_head_new = "";
let page_canvas_open = "<div id='mainContainerId'>";
let page_canvas_close = "</div>";
let page_html_el_new = "";
let page_css_new = "#mainContainerId{display:flex;overflow:hidden;width:MyWidth;height:MyHeight;border:1px solid grey;}";
let page_script_new = "";


// collections
//fonts
let font_family_serif = ['Georgia, serif', '"Palatino Linotype", "Book Antiqua", Palatino, serif', '"Times New Roman", Times, serif'];
let font_family_sans_serif = ['Arial, Helvetica, sans-serif', '"Arial Black", Gadget, sans-serif', '"Comic Sans MS", cursive, sans-serif', 
                              'Impact, Charcoal, sans-serif', '"Lucida Sans Unicode", "Lucida Grande", sans-serif', 'Tahoma, Geneva, sans-serif',
                              '"Trebuchet MS", Helvetica, sans-serif', 'Verdana, Geneva, sans-serif'];
let font_family_monospace = ['"Courier New", Courier, monospace', '"Lucida Console", Monaco, monospace']

// animations
function get_ani_text (type, color) {

    let ani = '';
    if (type == 'glow_neon1') {
        ani = "glow_neon1 {from {color: " + color + "; text-shadow: 0 0 10px #ff3d3d, 0 0 20px #ff3d3d, 0 0 30px #ff3d3d, 0 0 40px #ff3d3d, 0 0 50px #ff3d3d, 0 0 60px #ff3d3d, 0 0 70px #ff3d3d, 0 0 90px #ff3d3d;}" + 
                         "to {color: gray; text-shadow: 0 0 20px #ff3d3d, 0 0 30px #ff3d3d, 0 0 40px #ff3d3d, 0 0 50px #ff3d3d, 0 0 60px #ff3d3d, 0 0 70px #ff3d3d, 0 0 80px #ff3d3d, 0 1 90px #ff3d3d;}}"
        ani = add_keyframe_spec(ani);
    }
    return ani
}



// --------------- functions ---------------
// color conversions
import {fct_hex2rgb} from 'modules/color_conversions.js';

// save file
function save_html_file (file_name, new_file) {
    let fs = require('fs');
    fs.writeFile(file_name, new_file, (error) => { /* handle error */ });
}

function select_random (array) {
    return array[Math.floor(Math.random()*array.length)];
}

function break_words_to_lines (text, max_lines) {
    let n_words = text.split(/ +/g).length;
    if (n_words <= max_lines) {
        text = text.split(/ +/g).join('<br>');
    }
    return text
}

function add_ani_spec (ani_spec) {
    let ani_spec_full = "-webkit-animation: " + ani_spec + "; " + 
                        "-moz-animation: " + ani_spec + "; " +
                        "-ms-animation: " + ani_spec + "; " +
                        "-o-animation: " + ani_spec + "; " +
                        "-animation: " + ani_spec + "; "
    return ani_spec_full;
}

function add_keyframe_spec (keyframe_spec) {
    let keframe_spec_full = "@-webkit-keyframes " + keyframe_spec + ";" + 
                            "@-moz-keyframes " + keyframe_spec + ";" + 
                            "@-ms-keyframes " + keyframe_spec + ";" + 
                            "@-o-keyframes " + keyframe_spec + ";" + 
                            "@-keyframes " + keyframe_spec + ";";
    return keframe_spec_full;
}





// class canvas
class Canvas {
    constructor (width, height, page_head_new, page_html_el_new, page_css_new, page_script_new) {
        this.width = width;
        this.height = height;
        this.page_head_new = page_head_new;
        this.page_html_el_new = page_html_el_new;
        this.page_css_new = page_css_new;
        this.page_script_new = page_script_new;
        this.id_enumerator = 0;
    }

    // update canvas size
    adjust_canvas_size () {
        this.page_css_new = this.page_css_new.split('MyWidth').join(mywidth);
        this.page_css_new = this.page_css_new.split('MyHeight').join(myheight);
    }

    // add background color of the form '#ff0000'
    addBgColor (color) {
        this.page_css_new = this.page_css_new + "#mainContainerId{background:" + color + "}";
    }

    // add html element
    add_html_element (type, stringText='') {
        let t_id = '';
        if (type == 'text') {
            let t_id = 'elementId' + this.id_enumerator;
            this.page_html_el_new = this.page_html_el_new + "<p id='" + t_id + "'>" + stringText + "</p>";
            this.id_enumerator = this.id_enumerator + 1;
            return t_id
        }
    }

    // add title
    addTitle (stringText, colorText, style) {

        let fontSize = this.width / 10;
        let t_ani_time = 2 + 's';

        if (style == 'neon_dots') {

            // substyle
            let substyle = "glow_neon1";

            // break into words
            stringText = break_words_to_lines(stringText, 4);

            // html element
            let t_id = this.add_html_element('text', stringText);
            
            // font
            this.page_head_new = this.page_head_new + "<link href='https://fonts.googleapis.com/css?family=Codystar:300&display=swap' rel='stylesheet'>";
            
            // text style
            let t_position = "margin: auto;";
            let t_shape = 'max-width: 80%; text-align: center;';
            let t_color = "color: " + colorText + ";";
            let t_font = "font-size: " + fontSize + "; font-family: 'Codystar';";

            // text animation            
            let t_ani_spec = substyle + " " + t_ani_time + " ease-in-out infinite alternate";
            let t_animation = add_ani_spec(t_ani_spec);  
            let t_keyframes = get_ani_text(substyle, colorText);

            // update style
            this.page_css_new = this.page_css_new + "#" + t_id + "{" + t_position + t_shape + t_color + t_font + t_animation + "} " + t_keyframes;
            
        }
    }


    // add text
    addText (stringText, colorText, colorBg='', fontFamily='', fontSize='') {

        if (fontSize == '') fontSize = this.width / 15;
        if (fontFamily == '') fontFamily = select_random(font_family_sans_serif);
        let t_padding = 20 + 'px';

        if (typeof stringText == 'string'){            

            this.page_html_el_new = this.page_html_el_new + "<p id='elementId" + this.id_enumerator + "'>" + stringText + "</p>";

            let t_position = "margin: auto; ";
            let t_shape = "padding: " + t_padding + "; border: 5px solid red;";
            let t_color = "color: " + colorText + "; background: " + colorBg + ";";
            let t_font = "font-size: " + fontSize + "; font-family: " + fontFamily + ";";

            this.page_css_new = this.page_css_new + "#elementId" + this.id_enumerator + "{" + t_position + t_shape + t_color + t_font + "}"

            this.id_enumerator = this.id_enumerator + 1;

        } else {

        }
    }




}




// --------------- run ---------------
// ajdust canvas size
let mywidth = 800;
let myheight = 600;

myCanvas = new Canvas(mywidth, myheight, page_head_new, page_html_el_new, page_css_new, page_script_new);
myCanvas.adjust_canvas_size();
myCanvas.addBgColor('#001352');
//myCanvas.addText('test', '#ff0000', '#ffffff', '');
myCanvas.addTitle('Test animation by artista', '#00ff00', 'neon_dots')

// change background color




let new_file = '<html>' + '<head>' + myCanvas.page_head_new + '</head>' + 
                '<style>' + myCanvas.page_css_new + '</style>' +
                '<body>' + page_canvas_open + myCanvas.page_html_el_new + page_canvas_close + '</body>' + 
                '<script>' + myCanvas.page_script_new + '</script>' + 
                '</html>';
save_html_file('test.html', new_file);
