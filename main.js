//@ts-check
'use strict';

async function preload_imgs() {
    let urls = (new Array(31)).fill(0).map((_, i) => `res/mochispinRTX${Math.floor(i).toString().padStart(4, "0")}.png`);
    
    let prms = urls.map(async s => new Promise(resolve => {
        let img = new Image();
        img.onload = resolve;
        img.src = s;
    }));
    await Promise.all(prms);
}

function gen_objs(num, scl, sx, sy, who) {
    let par = document.getElementById("container");
    par.style.setProperty("--sz", `${scl * 100}%`);

    let mxy = (1 - scl / 2);
    let mxy2 = scl/4;
    let pos = (new Array(num))
        .fill(0)
        .map((_, i) => ({
            x: Math.random() * mxy - mxy2,
            y: Math.random() * mxy - mxy2,
        }));
    pos.sort((a, b) => a.y - b.y);
    par.innerHTML = pos.map((o, i) => `
<img class="find_obj" data-i=${i} src="res/mochispinRTX${(i === who) ? "0030" : Math.floor(Math.random() * 30).toString().padStart(4, "0")}.png" style="--x:${o.x * 100}%;--y:${o.y * 100}%"></img>
        `).join("");
}

(async function() {
    await preload_imgs();

    let who = Math.floor(Math.random() * 1000);

    gen_objs(1000, 0.1, 400, 300, who);

    let cddiv = document.getElementById("cdtext");
    
    const count1 = async() => new Promise(resolve => setTimeout(resolve, 1000));

    document.getElementById("retry").addEventListener("click", () => {
        location.reload();
    });

    let t0;

    for (let o of document.getElementsByClassName("find_obj")) {
        o.addEventListener("click", o => {
            if (+o.target.dataset.i === who) {
                let ts = (Date.now() - t0) / 1000 + "s";
                document.getElementById("won_time").innerText = ts;
                document.getElementById("won").style.display = null;
            }
        });
    }

    cddiv.innerText = "3";
    await count1();
    cddiv.innerText = "2";
    await count1();
    cddiv.innerText = "1";
    await count1();
    cddiv.innerText = "Find the Imposter!";
    await count1();
    document.getElementById("countdown").style.display = "none";
    t0 = Date.now();
})();