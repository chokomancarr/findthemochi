//@ts-check
'use strict';

(async function() {
    let args = {};
    (document.URL.split("?")[1] ?? "").split("&").forEach(a => {
        let [k, v] = a.split("=");
        args[k] = v;
    });


    document.getElementById("wack_group").innerHTML =
        new Array(20).fill(0).map((_, i) => {
            let x = i % 4;
            let y = (i / 4) >> 0;
            return `
${(y > 0) ? `
    <image id="wack_target_${x}_${y-1}" class="wack_target" data-x="${x}" data-y="${y-1}" href="../res/mochispinRTX0000.png" x="${-58 + x * 30}" y="${-88 + y * 30}" width="26" height="26"/>
    <image id="wack_target_${x}_${y-1}_bad" class="wack_target" data-x="${x}" data-y="${y-1}" href="../res/mochispinRTX0030.png" x="${-58 + x * 30}" y="${-88 + y * 30}" width="26" height="26"/>
` : ""}
<rect x="${-55 + x * 30}" y="${-50 + y * 30}" width="20" height="10" fill="#ccc"/>
<path d="
    M ${-45 + x * 30}, ${-75 + y * 30}
    m -15, 0
    l 5, 0
    a 10,5 0 1,0 20,0
    l 5, 0
    l 0, 30
    l -5, 0
    a 10,5 0 1,0 -20,0
    l -5, 0
    z
" fill="white"/>`;
        }
    ).join(" ");

    let targets = new Array(4).fill(0).map(_ => [0,0,0,0]);
    let canwack = new Array(4).fill(0).map(_ => Array(4).fill(false));

    const delay = ms => new Promise(res => setTimeout(res, ms));
    
    let ovl = document.getElementById("ovl_txt");
    
    let playing = true;
    let score = 0;

    let t0;

    const infinite = args["infinite"] === "1";
    const MAX_TIME = 60000;
    const end_t = infinite? -1 : t0 + MAX_TIME;
    
    let bar = document.getElementById("time_bar");
    if (!infinite) bar.style.display = null;

    let drop_queue = [];
    let end_queue = [];

    function add_target(t) {
        let x;
        let y;
        do {
            x = (Math.random() * 4) >> 0;
            y = (Math.random() * 4) >> 0;
        } while (targets[x][y] > 0);
        let bad = Math.random() > 0.8;
        targets[x][y] = bad ? 2 : 1;
        let img = document.getElementById(`wack_target_${x}_${y}` + (bad ? "_bad" : ""));
        img.classList.add("show");
        drop_queue.push({
            x: x,
            y: y,
            img: img,
            t: t + 2000,
        });
        canwack[x][y] = true;
    }

    for (let tar of document.getElementsByClassName("wack_target")) {
        tar.addEventListener("click", e => {
            if (playing) {
                let x = +e.target.dataset.x;
                let y = +e.target.dataset.y;
                if (!canwack[x][y]) return;
                canwack[x][y] = false;
                let f_d = drop_queue.findIndex(d => d.img === e.target);
                if (f_d > -1) {
                    e.target.classList.remove("show");
                    let o = drop_queue.splice(f_d, 1)[0];
                    o.t = t0 + 1200;
                    end_queue.push(o);
                }
                score += (targets[x][y] === 1) ? 10 : -50; 
                ovl.innerText = "SCORE: " + score;
            }
        });
    }

    ovl.innerText = "3";
    await delay(1000);
    ovl.innerText = "2";
    await delay(1000);
    ovl.innerText = "1";
    await delay(1000);
    ovl.innerText = "GO!";
    await delay(1000);
    ovl.innerText = "SCORE: 0";
    
    t0= performance.now();
    let spawn_t = t0 + 1000;

    function loop(t) {
        let dt = t - t0;
        t0 = t;

        if (spawn_t < t) {
            spawn_t = t + 1000;
            add_target(t);
        }

        for (let a = drop_queue.length - 1; a >= 0; a -= 1) {
            let o = drop_queue[a];
            if (o.t < t) {
                drop_queue.splice(a, 1);
                end_queue.push(o);
                o.t += 1000;
                o.img.classList.remove("show");
            }
        }

        for (let a = end_queue.length - 1; a >= 0; a -= 1) {
            let o = end_queue[a];
            if (o.t < t) {
                end_queue.splice(a, 1);
                targets[o.x][o.y] = 0;
                canwack[o.x][o.y] = false;
            }
        }

        bar.setAttribute("width", (end_t - t) / MAX_TIME * 120 + "");

        if (!infinite && t > end_t) {
            bar.style.display = "none";
            ovl.classList.add("bold");
            playing = false;

            drop_queue.forEach(d => d.img.classList.remove("show"));
        }
        else {
            requestAnimationFrame(loop);
        }
    }

    requestAnimationFrame(loop);
})();