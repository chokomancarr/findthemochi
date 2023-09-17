//@ts-check
'use strict';

(async function() {
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
" fill="white"/>
        `}
    ).join(" ");

    let targets = new Array(4).fill(0).map(_ => [0,0,0,0]);

    const delay = ms => new Promise(res => setTimeout(res, ms));
    
    async function add_target() {
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
        await delay(2000);
        img.classList.remove("show");
        await delay(1200);
        targets[x][y] = 0;
    }
    
    let ovl = document.getElementById("ovl_txt");

    let playing = true;
    let score = 0;

    ovl.innerText = "3";
    await delay(1000);
    ovl.innerText = "2";
    await delay(1000);
    ovl.innerText = "1";
    await delay(1000);
    ovl.innerText = "GO!";
    await delay(1000);
    ovl.innerText = "SCORE: 0";

    let now = Date.now();

    const MAX_TIME = 60;

    (async function() {
        let bar = document.getElementById("time_bar");
        bar.style.display = null;
        while (playing) {
            await delay(100);
            let t = Date.now();
            let tn = Math.max(MAX_TIME - (t - now) * 0.001, 0);
            bar.setAttribute("width", tn / MAX_TIME * 120 + "");
            if (tn === 0) playing = false;
        }
    })();

    for (let tar of document.getElementsByClassName("wack_target")) {
        tar.addEventListener("click", e => {
            if (playing) {
                let x = +e.target.dataset.x;
                let y = +e.target.dataset.y;
                let ty = targets[x][y];
                if (ty === 0) return;
                targets[x][y] = 0;
                e.target.classList.remove("show");
                if (ty === 1) score += 10;
                else if (ty === 2) score -= 50;
                ovl.innerText = "SCORE: " + score;
            }
        });
    }

    while (playing) {
        add_target();
        await delay(1000);
    }

    ovl.classList.add("bold");
})();