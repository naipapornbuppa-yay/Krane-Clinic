import { chromium } from 'playwright';
const browser = await chromium.launch();
let count = 0;
const failures = [];
try {
  for (const width of [390,575,1200]) {
    for (const category of ['hair-skin','skin','weight','sexual-health','sleep-stress','hormone','general']) {
      const page = await browser.newPage({viewport:{width,height:784},reducedMotion:'reduce'});
      await page.goto(`http://127.0.0.1:5178/b2c/krane-b2c.html?demoStage=intake4&category=${category}#intake4`);
      await page.waitForTimeout(200);
      const rows = await page.evaluate(() => {
        const results=[];
        for (const id of INTAKE_ONE_QUESTION_SCREENS) {
          const screen=document.getElementById(id);
          if(!screen) continue;
          document.querySelectorAll('.screen').forEach(s=>{s.hidden=s!==screen;s.classList.toggle('active',s===screen)});
          screen.classList.remove('is-entering');
          setupIntakeQuestionPages(id);
          const state=intakeQuestionPageState(id);
          for(let i=0;i<state.total;i++) {
            activateIntakeQuestionPage(id,i);
            const q=state.questions[i];
            const title=q.querySelector('.intake-question__title') || state.body.querySelector('.h1');
            if(!title || !title.getClientRects().length) continue;
            const r=title.getBoundingClientRect(),body=state.body.getBoundingClientRect();
            results.push({id,i,x:r.x,y:r.y-body.y,expected:parseFloat(getComputedStyle(state.body).paddingTop)});
          }
        }
        return results;
      });
      for (const row of rows) { count++; if(Math.abs(row.y-row.expected)>1) failures.push({width,category,...row}); }
      await page.close();
    }
  }
  console.log(JSON.stringify({count,failures},null,2));
  if(!count || failures.length) process.exitCode=1;
} finally { await browser.close(); }
