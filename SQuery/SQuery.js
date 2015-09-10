/* SQuery : A small "JQuery" immitation */

S = (function createSQuery() {
  var EP = Element.prototype,
	CP = CSSStyleDeclaration.prototype;
  var aDOMFunc = [EP.removeAttribute, EP.setAttribute, CP.removeProperty, CP.setProperty];

  function set(bStyle, sProp, sVal) {
    var bSet = Boolean(sVal),
		fAction = aDOMFunc[bSet | bStyle << 1],
		aArgs = [].slice.call(arguments, 1, bSet ? 3 : 2),
		aNodeList = bStyle ? this.cssNodes : this.nodes;

    if (bSet && bStyle) {
      aArgs.push('');
    }
    for (
			var nItem = 0, nLen = this.nodes.length;
			nItem < nLen;
			fAction.apply(aNodeList[nItem++], aArgs));
    this.follow = set.caller;
    return this;
  }

  function get(bStyle, sProp) {
    var fAction = (bStyle ? CP.getPropertyValue : EP.getAttribute),
		aNodeList = bStyle ? this.cssNodes : this.nodes;
    return fAction.call(aNodeList[0], sProp);
  }

  function styles(sProp, sVal) {
    return (arguments.length === 1 ? get.call(this, true, sProp) : set.call(this, true, sProp, sVal));
  };
  function attributes(sProp, sVal) {
    return (arguments.length === 1 ? get.call(this, false, sProp) : set.call(this, false, sProp, sVal));
  };
  function getSelectors() {
    return this.selectors;
  };
  function getNodes() {
    return this.nodes;
  };
  function forEach(callback) {
    [].forEach.call(this.nodes, callback);
    return this;
  };
  function setHTML(html) {
    return forEach.call(this, function (e) {
      e.innerHTML = html
    });
  };
  function setClick(callback) {
    return forEach.call(this, function (e) {
      e.onclick = callback
    });
  };
  function setOnchange(callback) {
    return forEach.call(this, function (e) {
      e.onchange = (function (el) {
        el.srcElement = (el.srcElement || el.target);
        callback(el)
      }).bind(e);
    });
  };
  function removeNode() {
    return forEach.call(this, function (e) {
      e.parentNode.removeChild(e)
    });
  };
  function appendNode(n) {
    return forEach.call(this, function (e) {
      if ([].toString.call(n) === "[object Function]") {
        [].forEach.call(n.nodes, e.appendChild);
      }
      else
        e.appendChild(n)
    });
  };
  function doAjax(method, url, data, successHandler, errorHandler) {
    var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    var hasResponseType = 'responseType' in xhr;
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    if (hasResponseType)
      xhr.responseType = 'json';
    xhr.onreadystatechange = function () {
      var status = xhr.status,
			data;
      if (xhr.readyState == 4) {
        if (status.toString().indexOf("2") === 0) {
          successHandler && successHandler(hasResponseType ? xhr.response : JSON.parse(xhr.responseText));
        } else {
          errorHandler && errorHandler(status);
        }
      }
    };
    xhr.send(data);
  };

  var s = (function (sSelectors) {

    if ([].toString.call(sSelectors) === "[object Function]")
      sSelectors = sSelectors();

    var sQuery = new Function('return arguments.callee.follow.apply(arguments.callee, arguments)');
    //"internal"
    sQuery.selectors = sSelectors;

    if (/<[a-z][\s\S]*>/i.test(sSelectors)) { //looks like xhtml
      var parser = new DOMParser();
      sQuery.nodes = parser.parseFromString(sSelectors, "text/xml").childNodes;
    } else {
      sQuery.nodes = document.querySelectorAll(sSelectors);
    }
    sQuery.cssNodes = [].map.call(sQuery.nodes, function (oInlineCSS) {
      return oInlineCSS.style;
    });
    sQuery.follow = getNodes;
    //"external"
    sQuery.attr = attributes;
    sQuery.css = styles;
    sQuery.toString = getSelectors;
    sQuery.valueOf = getNodes;
    sQuery.each = forEach;
    sQuery.html = setHTML;
    sQuery.click = setClick;
    sQuery.change = setOnchange;
    sQuery.show = styles.bind(sQuery, "display", "block");
    sQuery.hide = styles.bind(sQuery, "display", "none");
    sQuery.remove = removeNode;
    sQuery.append = appendNode;
    return sQuery;
  });

  s.ajax = doAjax;

  return s;
})();