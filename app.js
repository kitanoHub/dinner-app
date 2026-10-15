let RECIPES=[],CONFIG={};

const $=id=>document.getElementById(id);
const toks=s=>s.toLowerCase().replace(/[、，]/g,',').split(/[\s,]+/).map(v=>v.trim()).filter(Boolean);
const unique=arr=>[...new Set(arr)].sort((a,b)=>a.localeCompare(b,'ja'));
const fill=(id,arr)=>{$(id).innerHTML=arr.map(v=>`<option value="${v}">${v}</option>`).join('')};

function flattenRecipeText(obj){
  const lines=[];
  for(const [section,steps] of Object.entries(obj||{})){
    lines.push(`<div class="sectiontitle">${section}</div><ol class="steps">${steps.map(s=>`<li>${s}</li>`).join('')}</ol>`);
  }
  return lines.join('');
}

function applyConfig(){
  $('headline').textContent=CONFIG.ui.headline;
  $('subheadline').textContent=CONFIG.ui.subheadline;
  $('totalRecipes').textContent=`登録レシピ ${RECIPES.length}件`;
  const L=CONFIG.ui.labels;
  $('label-ingredient').textContent=L.ingredient;
  $('label-carb').textContent=L.carb_type;
  $('label-richness').textContent=L.richness;
  $('label-temperature').textContent=L.temperature;
  $('search').textContent=L.search;
  $('reset').textContent=L.reset;
  fill('ingredient',CONFIG.filters.ingredient||['指定なし',...unique(RECIPES.flatMap(r=>r.main_ingredients||[]))]);
  fill('carb',CONFIG.filters.carb_type);
  fill('dish',CONFIG.filters.dish_type);
  fill('richness',CONFIG.filters.richness);
  fill('temperature',CONFIG.filters.temperature);
}

function scoreRecipe(r){
  const S=CONFIG.scoring;
  let score=0, matched=[];
  const ingredient=$('ingredient').value, carb=$('carb').value, dish=$('dish').value, richness=$('richness').value;
  const temperature=$('temperature').value;

  if(ingredient!=='指定なし'&&(r.main_ingredients||[]).includes(ingredient)){score+=S.ingredient_exact;matched.push('食材')}
  if(carb!=='指定なし'){
    const type1match = carb==='鍋' ? (r.dish_type||[]).includes('鍋') : (r.carb_type||[]).includes(carb);
    if(type1match){score+=S.carb_type;matched.push('タイプ1')}
  }
  if(dish!=='指定なし'&&(r.dish_type||[]).includes(dish)){score+=S.dish_type;matched.push('料理タイプ')}

  if(richness!=='指定なし'){
    let type2match=false;
    if(['さっぱり','こってり'].includes(richness)) type2match=(r.richness===richness);
    else if(richness==='辛い系') type2match=['少し辛い','辛い'].includes(r.spice)||(r.tags||[]).includes('辛い');
    else if(richness==='酸っぱい系') type2match=(r.flavors||[]).some(x=>x.includes('酸っぱい')||x.includes('ポン酢'))||(r.tags||[]).includes('酸っぱい');
    else if(richness==='甘い系') type2match=(r.flavors||[]).some(x=>x.includes('甘め')||x.includes('甘辛')||x.includes('甘酸っぱい'));
    if(type2match){score+=S.richness;matched.push('タイプ2')}
  }

  if(temperature!=='指定なし'&&(r.temperature||[]).includes(temperature)){score+=S.temperature;matched.push('温度')}
  return {...r,score,matched};
}
function render(){
  const ids=['ingredient','carb','dish','richness','temperature'];
  const active=ids.some(id=>$(id).value!=='指定なし');
  let ranked=RECIPES.map(scoreRecipe).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,'ja'));
  if(active) ranked=ranked.filter(r=>r.score>0);
  $('count').textContent=`登録 ${RECIPES.length}件 / 表示 ${ranked.length}件`;
  const top=ranked.slice(0,10);
  $('results').innerHTML=top.length?top.map(r=>`<article class="recipe">
    <div class="rhead"><div class="emoji">🍽️</div><div><div class="name">${r.name}</div>
    <div class="badges">
      ${(r.carb_type||[]).map(x=>`<span class="badge">${x}</span>`).join('')}
      ${(r.dish_type||[]).map(x=>`<span class="badge">${x}</span>`).join('')}
      ${(r.temperature||[]).map(x=>`<span class="badge">${x}</span>`).join('')}
      <span class="badge">${r.richness}</span><span class="badge">${r.spice}</span>
      ${r.servings?`<span class="badge">${r.servings}</span>`:''}<span class="badge">約${r.time_min}分</span>
    </div><div class="score">${active?`マッチスコア ${r.score} / ${r.matched.join('・')}`:'登録レシピ'}</div></div></div>
    <div class="sectiontitle">使う食材</div><div class="pillrow">${(r.main_ingredients||[]).map(x=>`<span class="pill">${x}</span>`).join('')}</div>
    <details class="details"><summary>レシピを見る</summary>${flattenRecipeText(r.recipe_text)}</details>
  </article>`).join(''):'<div class="empty">この条件に合うレシピがありません。条件を1つ減らしてみてください。</div>';
}

function resetFilters(){
  for(const id of ['ingredient','carb','dish','richness','temperature']) $(id).selectedIndex=0;
  render();
}

async function init(){
  try{
    const [recipesRes,configRes]=await Promise.all([fetch('./recipes.json'),fetch('./app-config.json')]);
    RECIPES=await recipesRes.json(); CONFIG=await configRes.json();
    applyConfig(); render();
    $('search').addEventListener('click',render);
    $('reset').addEventListener('click',resetFilters);
    if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  }catch(e){
    $('results').innerHTML='<div class="empty">データの読み込みに失敗しました。HTTPサーバー経由で開いているか確認してください。</div>';
    console.error(e);
  }
}
init();
