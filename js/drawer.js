function draw() {
    //Assegna un colore random a tutti i ragni che non ne hanno uno
    data.forEach(d => {
        if (!("color" in d)) {
            d.color = Math.floor(Math.random() * (colors.length - 1));
        }
    });

    let height = drawing_area.getBoundingClientRect().height;
    let width = drawing_area.getBoundingClientRect().width;

    HeadScale = d3.scaleLinear()
        .domain([d3.min(data, x => x.head), d3.max(data, x => x.head)])
        .range(head_range);

    EyeScale = d3.scaleLinear()
        .domain([d3.min(data, x => x.eye), d3.max(data, x => x.eye)])
        .range(eye_range)

    LegScale = d3.scaleLinear()
        .domain([d3.min(data, x => x.leg), d3.max(data, x => x.leg)])
        .range(legs_range)

    BodyScale = d3.scaleLinear()
        .domain([d3.min(data, x => x.body), d3.max(data, x => x.body)])
        .range(body_range)


    let margin = computeMargin(height, width, data, HeadScale, BodyScale, EyeScale, LegScale);

    xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.x)])
        .range([margin.margin_x, width - margin.margin_x])

    yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.y)])
        .range([margin.margin_y_up, height - margin.margin_y_down]);

    if (draw_axis)
        drawAxis(margin.margin_x, margin.margin_y_up, xScale, yScale);

    let svg = d3.select("#draw-area");

    //ENTER -> APPEND ELEMENTS
    let insects = svg.selectAll("g.insect-x-position")
        .data(data);

    insects = insects.enter()
        .append("g")
        .attr("class", "insect-x-position")
        .attr("position", "relative")
        .attr("id", d => `insect${d.id}`)
        .on("mouseover", onMouseOver)
        .on("mouseout", onMouseExit)
        .attr("transform", d => { return `translate(${xScale(d.x)}, -50)` });

    insects = insects
        .append("g")
        .attr("class", "insect")
        .attr("position", "relative");

    insects
        .append("circle")
        .attr("class", "insect-body")
        .style("fill", d => colors[d.color])
        .style("stroke", d => stroke_colors[d.color])
        .style("z-index", 2)
        .attr("position", "absolute")
        .attr("cx", 0);

    insects.append("circle")
        .attr("class", "insect-head")
        .style("fill", d => colors[d.color])
        .style("stroke", d => stroke_colors[d.color])
        .style("z-index", 2)
        .attr("position", "absolute")
        .attr("cx", 0)
        .attr("cy", 0);

    insects
        .append("g")
        .attr("class", "r-legs")
        .attr("position", "relative");

    insects.append("g")
        .attr("class", "l-legs")
        .attr("position", "relative");

    legs_options.forEach(opt => {
        opt.rotations.forEach(deg => {
            insects.select(opt.class)
                .append("path")
                .attr("class", `leg${deg}`)
                .attr("position", "absolute")
                .style("stroke", d => colors[d.color])
                .attr("d", d => computeStartLeg(opt.direction, HeadScale(d.head)));
        });
    });
    insects
        .append("image")
        .attr("class", "insect-eye")
        .style("z-index", 1)
        .attr("position", "absolute")
        .attr("xlink:href", "./sources/eye-2.png");


    //UPDATE
    insects = svg.selectAll("g.insect-x-position")
        .data(data)
        .attr("transform", d => { return `translate(${xScale(d.x)}, ${init_y})` });

    insects = svg
        .selectAll("g.insect")
        .data(data);

    insects
        .transition()
        .duration(animation_time)
        .attr("transform", d => { return `translate(0, ${yScale(d.y) - init_y})` });

    insects.selectAll(".insect-body")
        .transition()
        .duration(animation_time)
        .attr("cy", d => { return - 1 * (HeadScale(d.head) + 0.95 * BodyScale(d.body)) })
        .attr("r", d => BodyScale(d.body));

    insects.selectAll(".insect-head")
        .transition()
        .duration(animation_time)
        .attr("r", d => HeadScale(d.head))

    drawLegs(insects, LegScale, HeadScale);

    insects.selectAll(".insect-eye")
        .transition()
        .duration(animation_time)
        .attr("x", d => -1 * EyeScale(d.eye) / 2)
        .attr("y", d => HeadScale(d.head) * 0.8 - EyeScale(d.eye) / 2)
        .attr("width", d => EyeScale(d.eye))
        .attr("height", d => EyeScale(d.eye));


    setTimeout(() => {
        svg.selectAll("g.insect-x-position")
            .on("click", anim_function);
    }, animation_time);

    //REMOVED DATA
    insects.exit()
        .remove();
}

function drawLegs(insects, LegScale, HeadScale) {
    insects.selectAll(".leg").remove();
    legs_options.forEach(opt => {
        let legs_groups = insects.selectAll(opt.class);


        opt.rotations.forEach(degree => {
            legs_groups.select(`.leg${degree}`)
                .transition()
                .duration(animation_time)
                .attr("d", d => computeLegPath(opt.direction, LegScale(d.leg), HeadScale(d.head)))
                .attr("transform", d => applyRotation(degree))
        });
    });

}

function applyRotation(degree) {
    let tran = `rotate(${degree})`;
    return tran;
}

function computeStartLeg(direction, head) {
    return `M0,0 M0,0 M0,0`
}


function computeLegPath(direction, width, head) {
    let positions = [
        {
            x: direction * head,
            y: 0
        },
        {
            x: direction * (head + width / 2),
            y: -10
        },
        {
            x: direction * (head + width),
            y: 0
        }
    ]
    let line = d3.line()
        .x(p => p.x)
        .y(p => p.y)
    return line(positions);
}

function computeEyeXPos(d, LenScale, EyeScale) {
    let insect_len = LenScale(d.head);
    let eye_dim = EyeScale(d.eye) / 2;
    if (eye_dim > insect_len * 0.1) {  //Se coprio più del 10% della lunghezza
        eye_dim = insect_len * 0.1;
    }
    return insect_len - eye_dim;
}


function computeMargin(height, width, data, HeadScale, BodyScale, EyeScale, LegScale) {
    let max_dim_x = d3.max(data, x => {
        let head = HeadScale(x.head);
        return Math.max(head + LegScale(x.leg), EyeScale(x.eye) / 2, BodyScale(x.body));
    });

    let max_dim_y_up = d3.max(data, x => {
        let head = HeadScale(x.head);
        let body = BodyScale(x.body);
        return head + 2 * body;
    });

    let max_dim_y_down = d3.max(data, x => {
        let head = Math.max(HeadScale(x.head));
        return Math.max(head, head * 0.8 + EyeScale(x.eye) / 2);
    });

    let margin = {
        margin_x: Math.max(margin__perc_x * width, max_dim_x),
        margin_y_up: max_dim_y_up,
        margin_y_down: max_dim_y_down
    };

    return margin;
}

function drawAxis(m_x, m_y, xScale, yScale) {

    let svg = d3.select("#draw-area");
    let xAxis = d3.axisTop().scale(xScale).tickSize(5).ticks(25);
    let yAxis = d3.axisLeft().scale(yScale).tickSize(5).ticks(25);
    deleteAxis();
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${m_y})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${m_x}, 0)`)
        .call(yAxis)
    d3.axisLeft(yScale);

}
function deleteAxis() {
    d3.select("g.x-axis").remove();
    d3.select("g.y-axis").remove();
}


function swapAnimation(id_array) {
    let svg = d3.select("#draw-area");
    svg.selectAll("g.insect-x-position")
        .on("click", "");

    id_array.forEach(id => {
        svg.select(`#insect${id}`).select("g.insect")
            .data(data)
            .transition()
            .duration(animation_time)
            .attr("transform", "translate(0, 0)");
    })



    setTimeout(() => {
        id_array.forEach(id => {
            svg.selectAll("g.insect-x-position")
                .data(data)
                .filter(d => d.id == id)
                .attr("transform", d => { return `translate(${xScale(d.x)}, ${init_y})` });
        });
        draw();

    }, animation_time)
}
