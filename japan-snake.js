var CliFrames = require("cli-frames");
var clc = require('cli-color');
var red = clc.red,
blue = clc.xterm(21),
orange = clc.xterm(11),
green = clc.xterm(10);

const frames = [
    orange("╔════════════╗\n" +
    "║            ║\n" +
    "║   ٩(◕‿◕｡)۶ ║\n" +
    "║            ║\n" +
    "║            ║\n" +
    "╚════════════╝"),

    green("╔════════════╗\n" +
    "║            ║\n" +
    "║  ٩(◕‿◕｡)۶  ║\n" +
    "║            ║\n" +
    "║            ║\n" +
    "╚════════════╝"),

    blue("╔════════════╗\n" +
    "║            ║\n" +
    "║ ٩(◕‿◕｡)۶   ║\n" +
    "║            ║\n" +
    "║            ║\n" +
    "╚════════════╝"),

    red("╔════════════╗\n" +
    "║            ║\n" +
    "║ \(★ω★)/     ║\n" +
    "║            ║\n" +
    "║            ║\n" +
    "╚════════════╝"),
];


new CliFrames({
    frames: ["5", "4", "3", "2", "1"]
  , autostart: {
        delay: 1000
      , end: function (err, data) {
            var animation = new CliFrames();
            animation.load(frames);
            animation.start({
                repeat: true
              , delay: 250
            });
        }
    }
});
