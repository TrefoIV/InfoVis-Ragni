const margin__perc_x = 0.05;
const margin__perc_y = 0.05;
const min_insect_len = 15;
const max_insect_len = 150;
const head_range = [10, 50];
const body_range = [10, 50];
const eye_range = [25, 200];
const legs_range = [25, 100];
const init_y = 0;
const animation_time = 3000;
const legs_options = [
    {
        class: ".r-legs",
        direction: 1,
        rotations: [-10, 0, 10]
    },
    {
        class: ".l-legs",
        direction: -1,
        rotations: [-10, 0, 10]
    }
];

const colors1 = ["red", "blue", "green", "yellow", "pink", "cyan", "orange", "white", "purple"];
const colors = ["#ee4", "#d92626", "#2d2dd2", "#25b125", "#ec93a2", "#2fd0d0", "#d99a26", "#efecec", "#861386"];
const stroke_colors = ["#d2d214", "#9c1c1c", "#2424a8", "#1f931f", "#e36378", "#26a6a6", "#a5751d", "#ae9e9e", "#590d59"]
const features = ["x", "y", "head", "body", "eye", "leg"];