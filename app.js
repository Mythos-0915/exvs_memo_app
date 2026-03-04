document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('memoForm');
  const listEl = document.getElementById('list');
  const modal = document.getElementById('detailModal');
  const modalBody = document.getElementById('modalBody');
  const closeBtn = document.querySelector('.close');
  let memos = JSON.parse(localStorage.getItem('memos')) || [];
  
  // 詳細モーダル閉じる
  closeBtn.onclick = () => { modal.style.display = 'none'; };
  window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
  
  const render = () => {
    listEl.innerHTML = '';
    memos.forEach((memo, i) => {
      const div = document.createElement('div');
      div.className = 'memo';
      div.innerHTML = `
        <h3>${memo.date}</h3>
        <p><strong>自分:</strong> ${memo.my} | <strong>相方:</strong> ${memo.partner}</p>
        <p><strong>対面:</strong> ${memo.opp1} / ${memo.opp2}</p>
        <p><strong>要因:</strong> ${memo.reasons.join('、 ') || 'なし'}</p>
        ${memo.memoText && memo.memoText !== '(メモなし)' ? '<p><em>メモあり（タップで詳細）</em></p>' : ''}
      `;
      div.onclick = () => showDetail(memo, i);
      listEl.appendChild(div);
    });
    if (memos.length > 0) listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  function showDetail(memo, index) {
    const content = `
      <p><strong>日時:</strong> ${memo.date}</p>
      <p><strong>自分の機体:</strong> ${memo.my}</p>
      <p><strong>相方:</strong> ${memo.partner}</p>
      <p><strong>対面1:</strong> ${memo.opp1}</p>
      <p><strong>対面2:</strong> ${memo.opp2}</p>
      <p><strong>負け要因:</strong> ${memo.reasons.join('、 ') || 'なし'}</p>
      <hr>
      <h3>メモ</h3>
      <p style="white-space: pre-wrap; line-height: 1.6;">${memo.memoText || '（メモなし）'}</p>
      
      <button id="deleteThisMemo" style="background:#f44336; color:white; border:none; padding:12px 24px; font-size:1.1rem; border-radius:8px; margin-top:20px; width:100%; cursor:pointer;">
        🗑️ このメモを削除
      </button>
    `;
    modalBody.innerHTML = content;
    modal.style.display = 'block';
    
    const deleteBtn = document.getElementById('deleteThisMemo');
    if (deleteBtn) {
      deleteBtn.onclick = () => {
        // 自作確認ダイアログを表示
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        
        overlay.innerHTML = `
          <div class="confirm-box">
            <p>本当にこのメモを削除しますか？<br><strong>（元に戻せません）</strong></p>
            <button class="confirm-yes" id="confirmYes">はい、削除</button>
            <button class="confirm-no" id="confirmNo">キャンセル</button>
          </div>
        `;
        document.body.appendChild(overlay);
        
        document.getElementById('confirmYes').onclick = () => {
          memos.splice(index, 1);
          localStorage.setItem('memos', JSON.stringify(memos));
          modal.style.display = 'none';
          document.body.removeChild(overlay);
          render();
          
          // 削除成功フィードバック
          const msg = document.createElement('div');
          msg.textContent = '削除しました';
          msg.style = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#f44336; color:white; padding:12px 24px; border-radius:8px; z-index:100; font-weight:bold;';
          document.body.appendChild(msg);
          setTimeout(() => msg.remove(), 2000);
        };
        
        document.getElementById('confirmNo').onclick = () => {
          document.body.removeChild(overlay);
        };
      };
    }
  }
  
  form.onsubmit = (e) => {
    e.preventDefault();
    
    const checkedReasons = Array.from(
      form.querySelectorAll('input[type="checkbox"]:checked')
    ).map(cb => {
      if (cb.id === 'otherReasonCb') {
        const otherText = document.getElementById('otherReason').value.trim();
        return otherText || 'その他（詳細なし）';
      }
      return cb.value;
    }).filter(r => r);
    
    const memoText = document.getElementById('memoText').value.trim();
    
    if (!document.getElementById('myMecha').value.trim()) {
      alert('自分の機体を入力してください！'); // alertも出ない場合があるけど、必須項目なので残す
      return;
    }
    
    const memo = {
      date: new Date().toLocaleString('ja-JP'),
      my: document.getElementById('myMecha').value.trim(),
      partner: document.getElementById('partner').value.trim() || '-',
      opp1: document.getElementById('opp1').value.trim() || '-',
      opp2: document.getElementById('opp2').value.trim() || '-',
      reasons: checkedReasons.length > 0 ? checkedReasons : ['要因なし'],
      memoText: memoText || '(メモなし)'
    };
    
    memos.unshift(memo);
    localStorage.setItem('memos', JSON.stringify(memos));
    
    form.reset();
    document.getElementById('otherReason').style.display = 'none';
    
    // 保存成功フィードバック
    const successMsg = document.createElement('div');
    successMsg.textContent = '保存完了！';
    successMsg.style = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#4CAF50; color:white; padding:12px 24px; border-radius:8px; z-index:100; font-weight:bold;';
    document.body.appendChild(successMsg);
    setTimeout(() => successMsg.remove(), 2000);
    
    render();
  };
  
  document.getElementById('otherReasonCb').onchange = (e) => {
    document.getElementById('otherReason').style.display = e.target.checked ? 'inline' : 'none';
  };
  
  render(); // 初回描画
});