(function(){
  var toggle=document.getElementById('navToggle');
  var menu=document.getElementById('navList');
  if(toggle&&menu){toggle.addEventListener('click',function(){var open=menu.classList.toggle('is-open');toggle.setAttribute('aria-expanded',open);});menu.querySelectorAll('a').forEach(function(link){link.addEventListener('click',function(){menu.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');});});}
  var items=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}})},{threshold:.12});items.forEach(function(item){observer.observe(item);});}else{items.forEach(function(item){item.classList.add('is-visible');});}
  var form=document.getElementById('contactForm');
  var inquiry=document.getElementById('inquiryType');
  if(form&&inquiry){form.addEventListener('submit',function(){var notes=document.getElementById('message');if(notes&&!notes.value){notes.value='Inquiry type: '+inquiry.value;}});}
  var heroVisual=document.querySelector('.hero-visual');
  if(heroVisual){
    var ring=document.createElement('div'); ring.className='hero-ring';
    var ringProducts=[
      ['./images/webp/product-019.webp','Model 019 隐形遥控锁'],
      ['./images/webp/product-010.webp','Model 010 隐形遥控锁'],
      ['./images/webp/product-026.webp','Model 026 隐形智能锁'],
      ['./images/webp/product-F8.webp','指纹执手智能锁'],
      ['./images/webp/product-H2.webp','H2 智能门锁'],
      ['./images/webp/product-F6.webp','F6 智能门锁']
    ];
    ringProducts.forEach(function(item,index){var card=document.createElement('div');card.className='hero-ring-item';var image=document.createElement('img');image.src=item[0];image.alt=item[1];image.width=320;image.height=320;card.appendChild(image);card.addEventListener('mouseenter',function(){ring.classList.add('is-paused');card.classList.add('is-hovered');});card.addEventListener('mouseleave',function(){ring.classList.remove('is-paused');card.classList.remove('is-hovered');});ring.appendChild(card);});
    heroVisual.appendChild(ring);
  }
})();
