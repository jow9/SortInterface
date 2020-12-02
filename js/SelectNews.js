import anime from './node_modules/animejs/lib/anime.es.js';
//エラー:import declarations may only appear at top level of a module
//解決：moduleを利用するときはhtmlファイルでjsファイルを呼ぶ時にtype=moduleを宣言する必要がある

var worksElement = document.getElementsByClassName("works");
var leftClumWrapperElement = document.getElementsByClassName("leftclum-wrapper");
var rightClumWrapperElement = document.getElementsByClassName("rightclum-wrapper");
var centerClumWrapperElement = document.getElementsByClassName("centerclum-wrapper");
var nowActiveClum = "centerclum";

var article_json;//全記事データ
var read_article_list = [];//選択済み記事リスト
var no_read_article_list = [];//ゴミ箱記事リスト
var already_read_article_list = [];//既読記事リスト
var display_list = [];//メインコラムに表示中のリスト
var no_display_list = [];//非表示の記事リスト
var GerneList = []; //ジャンルリスト

var article_num = 4;

window.onload = function () {

  console.log("Onload SelectNews.js file");

  let moveElement = document.getElementsByClassName("MoveViewPage");
  moveElement[0].addEventListener(
    "click",
    function () {
      location.href = "reader.html";
    },
    false
  );

  //clumの操作
  leftClumWrapperElement[0].addEventListener(
    "click",
    function () {
      SetNowControlClum("leftclum");
    },
    false
  );

  rightClumWrapperElement[0].addEventListener(
    "click",
    function () {
      SetNowControlClum("rightclum");
    },
    false
  );

  centerClumWrapperElement[0].addEventListener(
    "click",
    function () {
      SetNowControlClum("centerclum");
    },
    false
  );

  document.getElementsByClassName("read_finish_button")[0].addEventListener(
    "click",
    function () {
      WriteAllToNoReadFile();
    },
    false
  );

  LogWriteFile("画面のリロード");

  //記事データの読み込み→読みたい記事リストの読み込み→読みたくない記事リストの読み込みを終えた後にコラムの作成を行う
  //ReadArticle() →  ReadListFile("read") → ReadListFile("noread") → CreateArticleList()の順に関数を呼び出す
  ReadArticle();
};

//window内でクリックされたら
window.onclick = function () {
  DeleteToMoveClum();
}



/*
//「to-move-right(left)-clum」が表示されている場合消す
*/
function DeleteToMoveClum() {
  let selectingElement = document.getElementsByClassName("work-block selecting");
  let length = selectingElement.length;
  if (length == 0) {
    console.log("読む読まないの2択中の記事はありません");
    return;
  }
  for (let i = 0; i < length; i = i + 1) {
    if (selectingElement[0] == this.undefined) return;
    selectingElement[0].classList.remove("selecting");
  }
}


/*
// now-active-clumを指定し、3つのコラムのうちアクティブ中のコラムを決める
// clickClum:クリックしたコラムの名前
*/
function SetNowControlClum(clickClum) {
  console.log(clickClum);
  switch (clickClum) {
    case "leftclum":
      leftClumWrapperElement[0].className = "leftclum-wrapper now-active-clum";
      rightClumWrapperElement[0].className = "rightclum-wrapper no-active-clum";
      centerClumWrapperElement[0].className = "centerclum-wrapper no-active-clum";
      break;

    case "rightclum":
      leftClumWrapperElement[0].className = "leftclum-wrapper no-active-clum";
      rightClumWrapperElement[0].className = "rightclum-wrapper now-active-clum";
      centerClumWrapperElement[0].className = "centerclum-wrapper no-active-clum";
      break;

    case "centerclum":
      leftClumWrapperElement[0].className = "leftclum-wrapper no-active-clum";
      rightClumWrapperElement[0].className = "rightclum-wrapper no-active-clum";
      centerClumWrapperElement[0].className = "centerclum-wrapper now-active-clum";
      break;
  }
  nowActiveClum = clickClum;
}


/*
// 記事を読み込む
*/
function ReadArticle() {
  let xmlHttpReq = new XMLHttpRequest();
  let cmd = "./rb/index.rb?cmd=readArray";

  xmlHttpReq.open("GET", cmd, true); //ここで指定するパスは、index.htmlファイルを基準にしたときの相対パス
  xmlHttpReq.responseType = "json";
  xmlHttpReq.send(null); //サーバーへのリクエストを送信する、引数はPOSTのときのみ利用

  xmlHttpReq.onreadystatechange = function () {
    if (xmlHttpReq.readyState == 4 && xmlHttpReq.status == 200) {
      //テキストの編集
      article_json = xmlHttpReq.response;

      for (let i = 0; i < Object.keys(article_json).length; i++) {
        let id = ('000' + i).slice(-3);
        no_display_list.push(id);

        //ジャンルリストを作成
        let txt_array = article_json[id].split(/\r?\n/);
        GerneList.push(txt_array[0]);
      }

      // ジャンルリストに重複が生まれないように余分な要素を削除
      GerneList = GerneList.filter(function (x, i, self) {
        return self.indexOf(x) === i;
      });

      console.log(GerneList);
      ReadListFile("read");
    }
  }
}

//渡されたオブジェクトに対してランダムな記事要素を挿入する
function AddToNoDisplyList(obj) {
  console.log("display_list:" + display_list);
  console.log("no_display_list:" + no_display_list);

  if (no_display_list.length <= 0) {
    console.log("これ以上候補となる記事はありません．");
    let h3Element = obj.getElementsByTagName("h3")[0];
    h3Element.innerHTML = "No Article";
    let h4Element = obj.getElementsByTagName("h4")[0];
    h4Element.innerHTML = "";
    let imgElement = obj.getElementsByTagName("img")[0];
    imgElement.src = "";

    return;
  }
  let ran = Math.floor(Math.random() * no_display_list.length);

  //1行目をジャンル、2行目を見出し、3行目を画像、4行目以降を本文として扱う
  //行単位に文章を分割する
  let txt_array = article_json[no_display_list[ran]].split(/\r?\n/);

  obj.id = no_display_list[ran];
  let h3Element = obj.getElementsByTagName("h3")[0];
  h3Element.innerHTML = txt_array[1];
  let h4Element = obj.getElementsByTagName("h4")[0];
  h4Element.className = "gerne_" + GerneList.indexOf(txt_array[0]);
  h4Element.innerHTML = "#" + txt_array[0];
  let imgElement = obj.getElementsByTagName("img")[0];
  imgElement.src = txt_array[2];
  if (imgElement.src == "") {
    imgElement.onerror = function () {
      this.style.display = "none";
    };
  }

  /*let pElement = document.createElement("p");
  let index = txt_array[3].indexOf("。"); //句点で本文を区切り最初の一文をアブストとして扱う
  pElement.innerHTML = txt_array[3].substring(0, index) + "。";
  */

  display_list.push(no_display_list[ran]);
  no_display_list = no_display_list.filter(function (a) {
    return a !== no_display_list[ran];
  });
}


/*
//記事リストを作成する
*/
function CreateArticleList() {
  console.log(Object.keys(article_json).length);
  console.log(article_json);

  for (let i = 0; i < article_num; i++) {
    //work-block要素の作成
    let workBlockElement = document.createElement("div");
    workBlockElement.className = "work-block now-sort-selected";

    workBlockElement.addEventListener(
      "click",
      function (e) {
        console.log("click");
        anime({
          targets: workBlockElement,
          opacity: {
            value: 0,
            duration: 200,
            endDelay: 200,
            easing: 'easeInExpo',
          },
          translateY: {
            value: 100,
          },
          complete: function () {
            ClickMainClum(workBlockElement);
            AddToNoDisplyList(workBlockElement);
            anime({
              targets: workBlockElement,
              opacity: {
                value: 1,
                duration: 200,
                easing: 'easeInExpo',
              },
              translateY: {
                value: 0,
                duration: 0,
              },
            })
          }
        })
      },
      false
    );

    let toMoveLeftClumElement = document.createElement("div");
    toMoveLeftClumElement.className = "to-move-left-clum-button";
    let leftClumimgElement = document.createElement("img");
    leftClumimgElement.src = "src/img/trash.png";
    toMoveLeftClumElement.appendChild(leftClumimgElement);

    toMoveLeftClumElement.addEventListener(
      "click",
      function (e) {
        if (nowActiveClum == "centerclum") {
          anime({
            targets: workBlockElement,
            // opacity: 0,
            opacity: {
              value: 0,
              duration: 200,
              endDelay: 200,
              easing: 'easeInExpo',
            },
            translateY: {
              value: -100,
            },
            complete: function () {
              if (nowActiveClum == "centerclum") {
                DeleteArticle(workBlockElement);
                AddToNoDisplyList(workBlockElement);
                anime({
                  targets: workBlockElement,
                  // opacity: 1,
                  opacity: {
                    value: 1,
                    duration: 200,
                    easing: 'easeInExpo',
                  },
                  translateY: {
                    value: 0,
                    duration: 0,
                  },
                })
              }
            }
          })
          e.stopPropagation();
        }
      },
      false
    );

    //work要素の作成
    let workElement = document.createElement("div");
    workElement.className = "work";

    //work-txt要素の作成
    let work_txtElement = document.createElement("div");
    work_txtElement.className = "work-txt";//クラス名にジャンルを追加する
    let h4Element = document.createElement("h4");
    let h3Element = document.createElement("h3");

    //img-block要素の作成
    let workImgElement = document.createElement("div");
    workImgElement.className = "workImg";
    let imgElement = document.createElement("img");

    work_txtElement.appendChild(h3Element);
    work_txtElement.appendChild(h4Element);
    //work_txtElement.appendChild(pElement);
    workImgElement.appendChild(imgElement);
    workElement.appendChild(workImgElement);
    workElement.appendChild(work_txtElement);

    // workElement.insertBefore(
    //   work_txtElement,
    //   workElement.firstChild
    // );

    //構造体の制作
    workBlockElement.appendChild(workElement);
    //workBlockElement.appendChild(toMoveRightClumElement);
    workBlockElement.appendChild(toMoveLeftClumElement);
    worksElement[0].appendChild(workBlockElement); //設定されたIDと登録順序が通信速度の差でずれてしまう

    AddToNoDisplyList(workBlockElement);
  }


  /*左右コラムを作成する*/
  for (let i = 0; i < already_read_article_list.length - 1; i++) {
    if (already_read_article_list[i] == "") {
      console.log("リストへの反映が終了");
      break;
    }
    console.log(already_read_article_list[i] + "番目の記事を読みたいリストに読み込む");
    let workBlockElement = document.getElementById(already_read_article_list[i]);
    CreateClum(workBlockElement, already_read_article_list[i], "alreadyread"); //右コラムを作成する
  }

  for (let i = 0; i < no_read_article_list.length - 1; i++) {
    if (no_read_article_list[i] == "") {
      console.log("リストへの反映が終了");
      break;
    }
    console.log(no_read_article_list[i] + "番目の記事を読みたいリストに読み込む");
    let workBlockElement = document.getElementById(no_read_article_list[i]);
    CreateClum(workBlockElement, no_read_article_list[i], "delete"); //左コラムを作成する
  }

  for (let i = 0; i < read_article_list.length - 1; i++) {
    if (read_article_list[i] == "") {
      console.log("リストへの反映が終了");
      break;
    }
    console.log(read_article_list[i] + "番目の記事を読みたいリストに読み込む");
    CreateReadClum(read_article_list[i]); //右コラムを作成する
  }
}


/*
//「読む」をクリックした場合対象とする記事を読みたい記事として扱う
*/
function ClickMainClum(obj) {
  let id = obj.id;
  if (id == "") {
    console.log("記事の選択されていません");
    return;
  }
  console.log("mainClumeで" + id + "番の記事をリスト化する");

  /*要素の取得*/
  let workBlockElement = document.getElementById(obj.id);

  WriteFile("read", id); //データベースに記事を登録する
  LogWriteFile(id + ":読みたい記事リストへ登録");
  CreateReadClum(id);

  console.log(display_list + "から" + id + "を削除");
  read_article_list.push(id);
  display_list = display_list.filter(function (a) {
    return a !== id;
  });
}

/*
// 「読まない」を選択した時の処理
// クリックした記事を読みたくない記事として登録する
//　deleteボタンを押す機能に近い
*/
function DeleteArticle(obj) {
  let id = obj.id;
  if (id == "") {
    console.log("記事の選択されていません");
    return;
  }
  console.log(
    "mainClumeで" + id + "番の記事を読みたくない記事として登録する"
  );

  /*要素の取得*/
  let workBlockElement = document.getElementById(id);

  WriteFile("noread", id); //データベースに記事を登録する
  CreateClum(workBlockElement, id, "delete"); //左コラムを作成する
  LogWriteFile(id + ":読みたくない記事リストへ登録");

  no_read_article_list.push(id);
  display_list = display_list.filter(function (a) {
    return a !== id;
  });
}


/*
//データの書き込み処理
//読みたい記事情報の登録
//読みたいくない記事情報の登録
//既読記事情報の登録
//引数1 article_abs:読みたいと読みたくないの記事の区別(文字列で　read or noread or alreadyread を指定する)
//引数2 article_id:登録する記事番号
*/
function WriteFile(article_abs, article_id) {
  console.log(article_abs + "にアクセス");
  console.log(article_id + "番の記事を登録");
  var xmlHttpReq = new XMLHttpRequest();
  var cmd = "./rb/index.rb?cmd=add";
  var fileName = "&fn=list/" + article_abs + "ArticleList.txt";
  var data = "&data=" + article_id;

  xmlHttpReq.open("GET", cmd + fileName + data, true); //ここで指定するパスは、index.htmlファイルを基準にしたときの相対パス
  xmlHttpReq.send(null); //サーバーへのリクエストを送信する、引数はPOSTのときのみ利用
}

/*
//ログの書き込み処理
*/
function LogWriteFile(action) {
  var now = new Date();
  console.log("ログの書き込み:" + action);

  var xmlHttpReq = new XMLHttpRequest();
  var cmd = "./rb/index.rb?cmd=logSave";

  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var hour = now.getHours();
  var min = now.getMinutes();
  var sec = now.getSeconds();

  let day =
    year +
    "/" +
    month +
    "/" +
    date +
    "/ " +
    hour +
    ":" +
    min +
    ":" +
    sec +
    "  ";
  var data = "&data=" + day + action;

  xmlHttpReq.open("GET", cmd + data, true); //ここで指定するパスは、index.htmlファイルを基準にしたときの相対パス
  xmlHttpReq.send(null); //サーバーへのリクエストを送信する、引数はPOSTのときのみ利用
}

/*
// データの書き換え
// 指定した文字列を削除し、リストから除外する
*/
function ReWriteFile(article_abs, article_id) {
  console.log(article_abs + "にアクセス");
  console.log(article_id + "番の記事を" + article_abs + "ArticleListから削除");
  var xmlHttpReq = new XMLHttpRequest();
  var cmd = "./rb/index.rb?cmd=rewrite";
  var fileName = "&fn=list/" + article_abs + "ArticleList.txt";
  var data = "&data=" + article_id; //消すデータ
  console.log(cmd + fileName + data);

  xmlHttpReq.open("GET", cmd + fileName + data, true); //ここで指定するパスは、index.htmlファイルを基準にしたときの相対パス
  xmlHttpReq.send(null); //サーバーへのリクエストを送信する、引数はPOSTのときのみ利用

  no_display_list.push(article_id);
  if (article_abs == "read") {
    read_article_list = read_article_list.filter(function (a) {
      return a !== article_id;
    });
  } else if (article_abs == "noread") {
    no_read_article_list = no_read_article_list.filter(function (a) {
      return a !== article_id;
    });
  } else {
    already_read_article_list = already_read_article_list.filter(function (a) {
      return a !== article_id;
    });
  }
}

/*
// 読了ボタンを押したときの処理
// 選択した記事を中央コラムから削除し、ファイルの書き換えを行う
*/
function WriteAllToNoReadFile() {
  LogWriteFile("選択記事の削除");
  if (document.getElementsByClassName("next_read_article").length == 0) {
    console.log("削除対象の記事が存在しません");
    return;
  }

  read_article_list = [];
  let xmlHttpReq = new XMLHttpRequest();
  let cmd = "./rb/index.rb?cmd=transAll";
  xmlHttpReq.open("GET", cmd, true);
  xmlHttpReq.send(null); //サーバーへのリクエストを送信する、引数はPOSTのときのみ利用

  xmlHttpReq.onreadystatechange = function () {
    if (xmlHttpReq.readyState == 4 && xmlHttpReq.status == 200) {
      let list = xmlHttpReq.responseText.split(/\n/);
      for (let i = 0; i < list.length; i++) {
        already_read_article_list.push(list[i]);

        if (list[i] == "") {
          console.log("リストへの反映が終了");
          break;
        }
        let workBlockElement = document.getElementById(list[i]);
        CreateClum(workBlockElement, list[i], "alreadyread");

        //要素を探索し削除
        document.getElementById("next_read_article_" + list[i]).remove();
      }
    }
  };
}

/*
// 左右のコラムを作成する
// 引数1（workBlockElement）:選択候補となる記事
// 引数2（id）:記事のid番号
// 引数3（select）:左コラムか右コラムの選択（delete:左コラム、read:右コラム）
*/
function CreateClum(workBlockElement, id, select) {
  let parentElementName = ""; //親要素名（delete_articles or want_read_articles）
  let classElementName = ""; //自身のクラス名（delete_article or want_read_article）
  let ElementStatus = ""; //記事の状態を選択する（noread or read）
  let targetClumName = ""; //クリックイベント時の今のアクティブコラムの判断に用いる(rightclum or leftclum)

  //selectに応じて上3つの変数の中身を決定する
  if (select == "delete") {
    parentElementName = "delete_articles";
    classElementName = "delete_article";
    ElementStatus = "noread";
    targetClumName = "leftclum";
  } else if (select == "alreadyread") {
    parentElementName = "want_read_articles";
    classElementName = "want_read_article";
    ElementStatus = "alreadyread";
    targetClumName = "rightclum";
  }

  let ArticlesElement = document.getElementsByClassName(parentElementName);

  //記事要素の作成
  let ArticleElement = document.createElement("div");
  ArticleElement.className = classElementName + " " + "now-sort-selected";
  ArticleElement.id = classElementName + "_" + id;
  ArticleElement.addEventListener(
    "click",
    function () {
      if (nowActiveClum == targetClumName) {
        //Listファイルから指定要素の削除
        ReWriteFile(ElementStatus, id);

        no_display_list.push(id);
        if (display_list.length < article_num) {
          for (let i = 0; i < article_num; i++) {
            let searchObj = document.getElementsByClassName("work-block")[i];
            if (searchObj.getElementsByTagName("h3")[0].innerHTML == "No Article") {
              AddToNoDisplyList(searchObj);
              break;
            }
          }
        }
        ArticleElement.remove();
      }
    },
    false
  );

  //1行目をジャンル、2行目を見出し、3行目を画像、4行目以降を本文として扱う
  //行単位に文章を分割する
  let txt_array = article_json[id].split(/\r?\n/);

  //h3要素（見出し）の作成
  let h3Element = document.createElement("h3");
  h3Element.innerHTML = txt_array[1];

  //h4要素（ジャンル）の作成
  let h4Element = document.createElement("h4");
  h4Element.innerHTML = txt_array[0];
  ArticleElement.classList.add(h4Element.innerHTML.replace("#", ""));

  ArticleElement.appendChild(h3Element);
  ArticleElement.appendChild(h4Element);
  ArticlesElement[0].appendChild(ArticleElement);
}

/*
// 読みたい記事リストを作成する
*/
function CreateReadClum(id) {
  let ArticlesElement = document.getElementsByClassName("next_read_articles");
  let txt_array = article_json[id].split(/\r?\n/);

  let ArticleElement = document.createElement("div");
  ArticleElement.className = "next_read_article gerne_" + GerneList.indexOf(txt_array[0]);
  ArticleElement.id = "next_read_article_" + id;

  anime({
    targets: ArticleElement,
    opacity: [0, 0.1],
    duration: 700,
    direction: 'normal',
  });

  ArticleElement.addEventListener(
    "mouseover",
    function () {
      anime({
        targets: ArticleElement,
        opacity: 1,
        duration: 100,
        direction: 'normal',
      });
    }
  );

  ArticleElement.addEventListener(
    "mouseout",
    function () {
      anime({
        targets: ArticleElement,
        opacity: 0.1,
        duration: 100,
        direction: 'normal',
      });
    }
  );

  ArticleElement.addEventListener(
    "click",
    function () {
      if (nowActiveClum == "centerclum") {
        //Listファイルから指定要素の削除
        ReWriteFile("read", id);

        no_display_list.push(id);
        if (display_list.length < article_num) {
          for (let i = 0; i < article_num; i++) {
            let searchObj = document.getElementsByClassName("work-block")[i];
            if (searchObj.getElementsByTagName("h3")[0].innerHTML == "No Article") {
              AddToNoDisplyList(searchObj);
              break;
            }
          }
        }
        ArticleElement.remove();
      }
    },
    false
  );

  let pElement = document.createElement("p");
  pElement.innerHTML = txt_array[1];
  let h4Element = document.createElement("h4");
  h4Element.innerHTML = "#" + txt_array[0];

  ArticleElement.appendChild(h4Element);
  ArticleElement.appendChild(pElement);
  ArticlesElement[0].appendChild(ArticleElement);
}

/*
//ブラウザを更新したときの処理
//指定したファイルからデータを読み込みmainclum（とreadページ）を編集する
//読みたいリスト、（と読みたくないリスト）からデータを取得して画面状態を生成する
*/
//後修正
function ReadListFile(article_abs) {
  console.log(article_abs + "にアクセス");
  var xmlHttpReq = new XMLHttpRequest();
  var cmd = "./rb/index.rb?cmd=read";
  var fileName = "&fn=list/" + article_abs + "ArticleList.txt";

  xmlHttpReq.open("GET", cmd + fileName, true); //ここで指定するパスは、index.htmlファイルを基準にしたときの相対パス
  xmlHttpReq.send(null); //サーバーへのリクエストを送信する、引数はPOSTのときのみ利用

  xmlHttpReq.onreadystatechange = function () {
    if (xmlHttpReq.readyState == 4 && xmlHttpReq.status == 200) {
      let list = xmlHttpReq.responseText.split(/\n/);

      if (article_abs == "read") {
        read_article_list = list;

        //no_display_listから選択済みの記事を削除する
        for (let i = 0; i < read_article_list.length; i++) {
          no_display_list = no_display_list.filter(function (a) {
            return a !== read_article_list[i];
          });
        }
        ReadListFile("noread");
      } else if (article_abs == "noread") {
        no_read_article_list = list;

        //no_display_listから選択済みの記事を削除する
        for (let i = 0; i < no_read_article_list.length; i++) {
          no_display_list = no_display_list.filter(function (a) {
            return a !== no_read_article_list[i];
          });
        }
        ReadListFile("alreadyread");
      } else {
        already_read_article_list = list;

        //no_display_listから選択済みの記事を削除する
        for (let i = 0; i < already_read_article_list.length; i++) {
          no_display_list = no_display_list.filter(function (a) {
            return a !== already_read_article_list[i];
          });
        }
        CreateArticleList();
      }
    }
  };
}