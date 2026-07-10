(function () {
    var WECHAT_PHONE = '+86 15914193183';
    var WECHAT_PHONE_RAW = '15914193183';

    // 可选：微信 → 我 → 二维码名片 → 分享 → 复制链接（形如 https://u.wechat.com/xxxxx）
    var WECHAT_CARD_URL = '';
    // 可选：可被搜索的微信号（不是手机号）
    var WECHAT_ID = '';

    function readMetaConfig() {
        var cardMeta = document.querySelector('meta[name="wechat-card-url"]');
        var idMeta = document.querySelector('meta[name="wechat-id"]');
        if (cardMeta && cardMeta.content) WECHAT_CARD_URL = cardMeta.content.trim();
        if (idMeta && idMeta.content) WECHAT_ID = idMeta.content.trim();
    }

    function getWeChatQrCandidates() {
        var list = [];
        var qr = document.querySelector('.float-kefu .qr-code[data-src], .float-kefu .qr-code[src]');

        if (qr && qr.dataset.src) list.push(qr.dataset.src);
        if (qr) {
            var qrSrc = qr.getAttribute('src');
            if (qrSrc) list.push(qrSrc);
        }

        var icon = document.querySelector('link[rel="icon"]');
        if (icon && icon.href) {
            list.push(icon.href.replace(/\/images\/[^/]+$/, '/images/webp/WeChat.webp'));
        }

        list.push('/images/webp/WeChat.webp');

        var script = document.querySelector(
            'script[src*="wechat-footer.js"], script[src*="all.js"], script[src*="contact-page.js"], script[src*="about-page.js"], script[src*="technology-page.js"]'
        );
        if (script) {
            var scriptSrc = script.getAttribute('src') || '';
            var root = scriptSrc.replace(/js\/[^/]*(\?.*)?$/, '');
            list.push(root + 'images/webp/WeChat.webp');
        }

        return list.filter(function (value, index, array) {
            return value && array.indexOf(value) === index;
        });
    }

    function setQrImage(img) {
        var candidates = getWeChatQrCandidates();
        var index = 0;

        function tryNext() {
            if (index >= candidates.length) {
                img.alt = '微信二维码加载失败';
                return;
            }

            img.onerror = function () {
                index += 1;
                tryNext();
            };
            img.src = candidates[index];
        }

        tryNext();
    }

    function showToast(message) {
        var toast = document.getElementById('wechatModalToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'wechatModalToast';
            toast.className = 'wechat-modal-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.classList.add('is-visible');
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(function () {
            toast.classList.remove('is-visible');
        }, 3200);
    }

    function copyPhoneNumber() {
        return new Promise(function (resolve, reject) {
            var text = WECHAT_PHONE_RAW;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(resolve).catch(reject);
                return;
            }

            try {
                var textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    function isMobileDevice() {
        return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    }

    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    function updateModalForDevice(modal) {
        var desc = modal.querySelector('.wechat-modal-desc');
        var openBtn = modal.querySelector('[data-wechat-open]');
        if (!desc || !openBtn) return;

        if (isMobileDevice()) {
            desc.textContent = '扫码添加微信，或复制手机号搜索添加';
            openBtn.textContent = '打开微信搜索';
            return;
        }

        desc.textContent = '请用手机微信扫描下方二维码，或复制手机号后在手机微信中搜索';
        openBtn.textContent = '打开微信电脑版';
    }

    function getWechatLaunchUrls() {
        var phone = WECHAT_PHONE_RAW;
        var encodedPhone = encodeURIComponent(phone);
        var urls = [];

        if (WECHAT_CARD_URL) {
            urls.push(WECHAT_CARD_URL);
        }

        if (WECHAT_ID) {
            urls.push('weixin://contacts/profile/' + encodeURIComponent(WECHAT_ID));
            urls.push('weixin://addfriend/' + encodeURIComponent(WECHAT_ID));
        }

        urls.push(
            'weixin://dl/searchresult?keyword=' + encodedPhone,
            'weixin://dl/addcontact?phone=' + phone,
            'weixin://dl/add?phone=' + phone,
            'weixin://dl/add'
        );

        return urls.filter(function (value, index, array) {
            return value && array.indexOf(value) === index;
        });
    }

    function navigateToUrl(url) {
        if (!url) return;

        if (/^https?:\/\//i.test(url)) {
            window.location.assign(url);
            return;
        }

        if (isAndroid() && /^weixin:\/\//i.test(url)) {
            var path = url.replace(/^weixin:\/\//i, '');
            var intentUrl =
                'intent://' + path +
                '#Intent;scheme=weixin;package=com.tencent.mm;end';
            window.location.assign(intentUrl);
            return;
        }

        var link = document.createElement('a');
        link.href = url;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function launchWechatApp() {
        var urls = getWechatLaunchUrls();
        navigateToUrl(urls[0]);
    }

    function handleCopyPhone() {
        copyPhoneNumber()
            .then(function () {
                showToast('已复制手机号，请打开微信 → 添加朋友 → 粘贴搜索');
            })
            .catch(function () {
                showToast('请手动复制：' + WECHAT_PHONE);
            });
    }

    function handleOpenWechat() {
        try {
            copyPhoneNumber();
        } catch (error) {
            /* 复制失败不阻断唤起微信 */
        }

        if (isMobileDevice()) {
            launchWechatApp();
            if (WECHAT_CARD_URL) {
                showToast('正在打开微信名片…');
                return;
            }
            showToast('已复制手机号，正在打开微信搜索…');
            return;
        }

        launchWechatApp();
        showToast('已复制手机号，正在尝试打开微信电脑版；若未弹出，请扫码或用手机微信搜索');
    }

    function ensureModal() {
        var modal = document.getElementById('wechatFooterModal');
        if (modal) return modal;

        modal = document.createElement('div');
        modal.id = 'wechatFooterModal';
        modal.className = 'wechat-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'wechatModalTitle');
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML =
            '<div class="wechat-modal-backdrop" data-wechat-close></div>' +
            '<div class="wechat-modal-dialog">' +
            '<button type="button" class="wechat-modal-close" aria-label="关闭" data-wechat-close>&times;</button>' +
            '<div class="wechat-modal-icon" aria-hidden="true"></div>' +
            '<h2 id="wechatModalTitle" class="wechat-modal-title">微信联系</h2>' +
            '<p class="wechat-modal-desc">扫码添加微信，或复制手机号搜索添加</p>' +
            '<img class="wechat-modal-qr" alt="微信二维码" width="200" height="200" decoding="async">' +
            '<p class="wechat-modal-phone">' + WECHAT_PHONE + '</p>' +
            '<div class="wechat-modal-actions">' +
            '<button type="button" class="wechat-modal-btn wechat-modal-btn-primary" data-wechat-copy>复制手机号</button>' +
            '<button type="button" class="wechat-modal-btn wechat-modal-btn-secondary" data-wechat-open>打开微信搜索</button>' +
            '</div>' +
            '<a class="wechat-modal-call" href="tel:+8615914193183">拨打电话</a>' +
            '</div>';

        document.body.appendChild(modal);

        modal.querySelectorAll('[data-wechat-close]').forEach(function (el) {
            el.addEventListener('click', closeModal);
        });

        modal.querySelector('[data-wechat-copy]').addEventListener('click', handleCopyPhone);
        modal.querySelector('[data-wechat-open]').addEventListener('click', handleOpenWechat);

        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
        });

        return modal;
    }

    function openModal() {
        var modal = ensureModal();
        var img = modal.querySelector('.wechat-modal-qr');
        if (img) setQrImage(img);
        updateModalForDevice(modal);
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('wechat-modal-open');
        modal.querySelector('.wechat-modal-close').focus();
    }

    function closeModal() {
        var modal = document.getElementById('wechatFooterModal');
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('wechat-modal-open');
    }

    function initFooterWechat() {
        if (document.documentElement.dataset.footerWechatInit === 'true') return;
        document.documentElement.dataset.footerWechatInit = 'true';

        document.addEventListener('click', function (e) {
            var link = e.target.closest(
                '.footer-socials .social-icon.wechat, .footer-socials .social-icon.whatsapp, ' +
                '.wafu-share-buttons .social-icon.wechat, .wafu-share-buttons .social-icon.whatsapp'
            );
            if (!link) return;
            e.preventDefault();
            openModal();
        });
    }

    function boot() {
        readMetaConfig();
        initFooterWechat();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    window.WafuWechatFooter = {
        init: initFooterWechat,
        open: openModal,
        close: closeModal,
        configure: function (options) {
            if (options && options.cardUrl) WECHAT_CARD_URL = options.cardUrl;
            if (options && options.wechatId) WECHAT_ID = options.wechatId;
        }
    };
})();
