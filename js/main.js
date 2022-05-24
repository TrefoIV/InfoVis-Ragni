let drawing_area;
let data;

let animation_type = 1;
let anim_function;
let draw_axis = false;

function removeOne() {
	if (data.length > 0) {
		console.log("Here")
		data.pop();
	}
	console.log(data);
	draw()
}
async function loadData() {
	await fetch('./data/data.json')
		.then(response => {
			if (!response.ok) {
				throw new Error("Http error " + response.status);
			}
			return response.json();
		})
		.then(d => {
			// Do something with your data
			data = d;
			setTimeout(() => {
				changeAnimationType();
				draw();
			}, 0);

		});
}

function copy(to, from, include = [], exclude = []) {

	return Object.keys(from).reduce((target, k) => {

		if (exclude.length) {
			if (exclude.indexOf(k) < 0) target[k] = from[k];
		} else if (include.indexOf(k) > -1) target[k] = from[k];
		return target;
	}, to);
}

function swapValues(event) {
	let id = event.path[2].id;
	let me = data.findIndex(x => "insect" + x.id == id);
	let other = Math.floor(Math.random() * (data.length - 1));
	if (other == me) {
		other = (me + 1) % data.length;
	}
	me = data[me];
	other = data[other];
	let exclude_attributes = ["id", "x", "y"];
	let temp = copy({}, me, null, exclude_attributes);
	copy(me, other, null, exclude_attributes);
	copy(other, temp, null, exclude_attributes);

	draw()
}

function swapPosition(event) {
	let id = event.path[2].id;
	let me = data.findIndex(x => "insect" + x.id == id);
	let other = Math.floor(Math.random() * (data.length - 1));
	if (other == me) {
		other = (me + 1) % data.length;
	}
	me = data[me];
	other = data[other];
	pos_att = ["x", "y"];
	let temp = copy({}, me, pos_att)
	copy(me, other, pos_att);
	copy(other, temp, pos_att);

	swapAnimation([me.id, other.id]);
}

function onMouseOver(event) {
	let id = event.path[2].id;
	let me = data.find(x => "insect" + x.id == id);
	if (me === undefined) return;
	changeDisplayedValues(me);
}
function onMouseExit(event) {
	changeDisplayedValues({});
}

function changeDisplayedValues(obj) {
	features.forEach(f => {
		let f_paragraph = document.getElementById(`${f}-display`);
		if (f in obj) {
			f_paragraph.innerHTML = `${f}: ${obj[f]}`;
		} else {
			f_paragraph.innerHTML = `${f}:`;
		}
	});
}


function changeAnimationType() {
	if (animation_type == 0) {
		animation_type = 1;
		anim_function = swapPosition;
	} else {
		animation_type = 0;
		anim_function = swapValues;
	}
	d3.select("#draw-area").selectAll("g.insect-x-position")
		.on("click", anim_function);
}

function changeDrawAxis() {
	draw_axis = !draw_axis;
	if (!draw_axis)
		deleteAxis();
	draw();
}

window.addEventListener("resize", () => {
	if (typeof data !== "undefined" && data !== null)
		draw();
});
window.onload = () => {
	drawing_area = document.getElementById("draw-area")
	loadData()
}
