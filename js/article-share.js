(function () {
    function getShareUrl() {
        var canonical = document.querySelector('link[rel="canonical"]');
        if (canonical && canonical.href) return canonical.href;
        return window.location.href.split('#')[0];
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

    function copyShareUrl() {
        var url = getShareUrl();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(url);
        }
        return new Promise(function (resolve, reject) {
            try {
                var textarea = document.createElement('textarea');
                textarea.value = url;
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

    document.addEventListener('click', function (event) {
        var btn = event.target.closest('.wafu-share-copy');
        if (!btn) return;
        event.preventDefault();
        copyShareUrl()
            .then(function () { showToast('链接已复制，可粘贴到微信分享'); })
            .catch(function () { showToast('复制失败，请手动复制地址栏链接'); });
    });
})();
