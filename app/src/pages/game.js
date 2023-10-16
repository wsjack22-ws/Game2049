export const Game2049 = () => {
    return (
        <div>
            <main class="wrapper">
                <div class="intro clearfix">
                    <h1 class="intro_title"> 2048 </h1>
                </div>

                <div class="controls clearfix">
                    <div class="controls_game">
                        <button data-js="newGame" class="controls_game-btn"> New Game </button>
                    </div>
                    <div class="controls_score">
                        <span class="controls_score-label">Score </span>
                        <br>
                            <span class="controls_score-text" data-js="score"> </span>
                        </></div>
                </div>

                <div id="touchGameboard" class="gameboard">
                    <div class="grid">
                    </div>
                    <div class="tile-container">
                    </div>
                </div>

                <section class="guide clearfix ">
                    <h2> What is this? </h2>
                    <p> Although coded entirely from scratch, this game is a (lackluster) copy of Gabriele Cirulli's 2048, http://2048game.com/.
                    </p>
                </section>
                <section class="guide clearfix">
                    <h2> How do I play? </h2>
                    <p> Tiles with matching number values can be merged into a single tile, which receives the values' sum.
                    </p>
                    <p> To move the board, use the directional arrows - or swipe.</p>
                    <div class="guide_arrow-wrap">
                        <span class="guide_arrow"> &uHar; </span>
                        <span class="guide_arrow"> &lHar; </span>
                        <span class="guide_arrow"> &rHar; </span>
                        <span class="guide_arrow"> &dHar; </span>
                    </div>
                    <p> To win, get a 2048 tile.
                    </p>
                </section>

            </main>

            <script type="text/html" id="template_grid_cell">
                <div class="grid_cell"></div>
            </script>

            <script type="text/html" id="template_tile">
                <div class="tile">
                    <span class="tile_number"> </span>
                </div>
            </script>

        </div>
    );
};
