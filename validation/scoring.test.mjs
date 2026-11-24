import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {stripTypeScriptTypes} from 'node:module';
const source=p=>stripTypeScriptTypes(fs.readFileSync(p,'utf8'),{mode:'transform'})
 .replace(/^import[\s\S]*?;\s*$/gm,'').replace(/^export\s*\{[^}]*\};?\s*$/gm,'')
 .replace(/\bexport\s+(?=(?:async\s+)?(?:function|const|let|class))/g,'');
const ctx={URL,Date,process:{env:{}}};vm.createContext(ctx);
vm.runInContext(source('lib/congress.ts')+'\n'+source('lib/scoring.ts')+'\nthis.api={computeScore,hasVerifiedSecSignals}',ctx);
const cases=JSON.parse(fs.readFileSync('validation/scoring-cases.json')).cases;
const plain=x=>JSON.parse(JSON.stringify(x));
for(const c of cases){
 const before=JSON.stringify(c);const result=ctx.api.computeScore(c.member,c.detail);
 assert.deepEqual(Object.fromEntries(Object.entries(result.components).map(([k,v])=>[k,v.score])),c.expected.components,c.name);
 assert.equal(result.total,c.expected.total,c.name);assert.deepEqual(plain(result.flags),c.expected.flags,c.name);
 assert.equal(ctx.api.hasVerifiedSecSignals(c.member)?c.member.corporate_insider_signals:0,c.expected.eligible_count,c.name);
 assert.deepEqual(Object.values(result.components).map(c=>c.max),[25,25,20,15,10,5],c.name);
 assert.equal(JSON.stringify(c),before,'raw input mutation: '+c.name);
}
console.log(JSON.stringify({cross_runtime_cases:cases.length,scores_flags_and_maxima:'passed',raw_inputs_unchanged:true}));
