var worksElement = document.getElementsByClassName("works");
var leftClumWrapperElement = document.getElementsByClassName("leftclum-wrapper");
var rightClumWrapperElement = document.getElementsByClassName("rightclum-wrapper");
var centerClumWrapperElement = document.getElementsByClassName("centerclum-wrapper");
var nowActiveClum = "centerclum";

var GerneList = ["すべて"]; //ジャンルリスト
var mainGerneCounter = [];
var readGerneCounter = [];
var noreadGerneCounter = [];

var data_max_num = 40; //データの上限を決める：ココのコード本当にひどい…

//ページ内で右クリックした際にメニュー表示するデフォルト機能を停止にする（後にこの機能は削除する）
// document.oncontextmenu = function () {
//   return false;
// };

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

  LogWriteFile("画面のリロード");
  CreateMainClum();
  MainClumIntotxt();
};

//window内でクリックされたら
window.onclick = function () {
  DeleteToMoveClum();
}


/*
//「to-move-right(left)-clum」が表示されている場合消す
*/
function DeleteToMoveClum() {
  let selectingElement = document.getElementsByClassName("work-block stu0 selecting");
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
      rightClumWrapperElement[0].className = "rightclum-wrapper no-active-clum layer1";
      centerClumWrapperElement[0].className = "centerclum-wrapper no-active-clum layer2";
      break;

    case "rightclum":
      leftClumWrapperElement[0].className = "leftclum-wrapper no-active-clum layer1";
      rightClumWrapperElement[0].className = "rightclum-wrapper now-active-clum";
      centerClumWrapperElement[0].className = "centerclum-wrapper no-active-clum layer2";
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
//mainClumを生成する
*/
function CreateMainClum() {
  for (let i = 0; i < data_max_num; i++) {
    let articleID = ('000' + i).slice(-3);

    //work-block要素の作成
    let workBlockElement = document.createElement("div");
    workBlockElement.className = "work-block stu0 now-sort-selected"; //stu0：未選択状態（デフォルト）, stu1：選択状態（半透明化）, stu2：コラムから除外した状態（非表示）
    workBlockElement.id = articleID;

    workBlockElement.addEventListener(
      "click",
      function (e) {
        DeleteToMoveClum();//別の記事の選択中だった場合それを削除
        if (nowActiveClum == "centerclum" && workBlockElement.classList.contains("selecting") == false) {
          workBlockElement.classList.add("selecting");
          e.stopPropagation();
        } else if (nowActiveClum == "centerclum" && workBlockElement.classList.contains("selecting")) {
          workBlockElement.classList.remove("selecting");
          e.stopPropagation();
        }
      },
      false
    );

    //左クリック時選択記事を「読みたい記事」として登録する
    // workBlockElement.addEventListener(
    //   "click",
    //   function () {
    //     if (nowActiveClum == "centerclum") {
    //       ClickMainClum({ id: selectNewsArray[i] });
    //     }
    //   },
    //   false
    // );

    //右クリック時選択記事を「読みたくない記事」として登録する
    // workBlockElement.addEventListener(
    //   "contextmenu",
    //   function () {
    //     DeleteArticle({ id: selectNewsArray[i] });
    //   },
    //   false
    // );

    let toMoveRightClumElement = document.createElement("div");
    toMoveRightClumElement.className = "to-move-right-clum-button";
    let rightClumh2Element = document.createElement("h2");
    rightClumh2Element.innerHTML = "読む";
    toMoveRightClumElement.appendChild(rightClumh2Element);

    let toMoveLeftClumElement = document.createElement("div");
    toMoveLeftClumElement.className = "to-move-left-clum-button";
    let leftClumh2Element = document.createElement("h2");
    leftClumh2Element.innerHTML = "読まない";
    toMoveLeftClumElement.appendChild(leftClumh2Element);

    toMoveRightClumElement.addEventListener(
      "click",
      function (e) {
        if (nowActiveClum == "centerclum") {
          ClickMainClum({ id: articleID });
          e.stopPropagation();
        }
      },
      false
    );

    toMoveLeftClumElement.addEventListener(
      "click",
      function (e) {
        if (nowActiveClum == "centerclum") {
          DeleteArticle({ id: articleID });
          e.stopPropagation();
        }
      },
      false
    );



    //work要素の作成
    let workElement = document.createElement("div");
    workElement.className = "work";

    //workImg要素の作成
    // let workImgElement = document.createElement("div");
    // workImgElement.className = "workImg";
    // let imgElement = document.createElement("img");
    // imgElement.src = "src/img/" + articleID + ".png";
    // imgElement.onerror = function () {
    //   this.style.display = "none";
    // };

    //構造体の制作
    //workImgElement.appendChild(imgElement);
    //workElement.appendChild(workImgElement);
    workBlockElement.appendChild(workElement);
    workBlockElement.appendChild(toMoveRightClumElement);
    workBlockElement.appendChild(toMoveLeftClumElement);
    worksElement[0].appendChild(workBlockElement); //設定されたIDと登録順序が通信速度の差でずれてしまう
  }
}

/*
// メインコラムにテキストを挿入する
*/
function MainClumIntotxt() {
  let workElements = document.getElementsByClassName("work");
  let xmlHttpReq = new XMLHttpRequest();
  let cmd = "./rb/index.rb?cmd=readArray";
  // let idArray = selectNewsArray[0];
  // for (var i = 1; i < selectNewsArray.length; i++) {
  //   idArray += "," + selectNewsArray[i];
  // }
  // let fileName = "&fn=" + idArray;//cmd=readArray&fn=001,002,003

  xmlHttpReq.open("GET", cmd, true); //ここで指定するパスは、index.htmlファイルを基準にしたときの相対パス
  xmlHttpReq.responseType = "json";
  xmlHttpReq.send(null); //サーバーへのリクエストを送信する、引数はPOSTのときのみ利用

  xmlHttpReq.onreadystatechange = function () {
    if (xmlHttpReq.readyState == 4 && xmlHttpReq.status == 200) {
      //テキストの編集
      let article_json = xmlHttpReq.response;
      console.log(article_json);

      let tempGerneList = ["すべて"];
      for (let i = 0; i < data_max_num; i++) {
        //1行目をジャンル、2行目を見出し、3行目以降を本文として扱う
        //行単位に文章を分割する
        let txt_array = article_json[('000' + i).slice(-3)].split(/\r?\n/);
        document.getElementsByClassName("work-block")[i].classList.add(txt_array[0]);//ジャンルの登録
        tempGerneList.push(txt_array[0]);

        //work-txt要素の作成
        let work_txtElement = document.createElement("div");
        work_txtElement.className = "work-txt";//クラス名にジャンルを追加する
        let h4Element = document.createElement("h4");
        let h3Element = document.createElement("h3");
        let pElement = document.createElement("p");

        h4Element.innerHTML = "#" + txt_array[0];
        h3Element.innerHTML = txt_array[1];
        let index = txt_array[3].indexOf("。"); //句点で本文を区切り最初の一文をアブストとして扱う
        pElement.innerHTML = txt_array[3].substring(0, index) + "。";


        //img-block要素の作成
        let workImgElement = document.createElement("div");
        workImgElement.className = "workImg";
        let imgElement = document.createElement("img");
        imgElement.src = txt_array[2];
        imgElement.onerror = function () {
          this.style.display = "none";
        };


        work_txtElement.appendChild(h3Element);
        work_txtElement.appendChild(h4Element);
        work_txtElement.appendChild(pElement);
        workElements[i].insertBefore(
          work_txtElement,
          workElements[i].firstChild
        );

        workImgElement.appendChild(imgElement);
        workElements[i].appendChild(workImgElement);

        //画面要素の状態の編集
        if (i == workElements.length - 1) {
          ReadListFile("read");
          ReadListFile("noread");
        }
      }

      // ジャンルリストに重複が生まれないように余分な要素を削除
      GerneList = tempGerneList.filter(function (x, i, self) {
        return self.indexOf(x) === i;
      });
      CreatDropDownMenu(GerneList);
      console.log(GerneList);

      for (let i = 1; i < GerneList.length; i++) {
        mainGerneCounter[GerneList[i]] = 0;
        readGerneCounter[GerneList[i]] = 0;
        noreadGerneCounter[GerneList[i]] = 0;
      }

      for (let i = 1; i < tempGerneList.length; i++) {
        mainGerneCounter[tempGerneList[i]] += 1;
      }

      //各ジャンル数をカウントし、要素を追加
      CreatGerneCounter("centerclum-wrapper", mainGerneCounter);
      CreatGerneCounter("rightclum-wrapper", readGerneCounter);
      CreatGerneCounter("leftclum-wrapper", noreadGerneCounter);
    }
  };
}


/*
//ジャンルリストをもとにドロップダウンメニューを作成
//list:配列を受け取りその要素をもとにドロップダウンメニューを作成
*/
function CreatDropDownMenu(list) {
  let selectElement = document.createElement("select");
  selectElement.name = "gerne";
  selectElement.className = "drop-list";

  let optionAllElement = document.createElement("option");
  optionAllElement.value = "すべて";
  optionAllElement.innerHTML = "すべて";
  selectElement.appendChild(optionAllElement);

  for (let i = 1; i < list.length; i++) {
    let optionElement = document.createElement("option");
    optionElement.value = list[i];
    optionElement.innerHTML = list[i];

    selectElement.appendChild(optionElement);
  }

  //親要素に登録
  let centerclum = document.getElementsByClassName("centerclum-wrapper")[0].getElementsByClassName("container");
  let rightclum = document.getElementsByClassName("rightclum-wrapper")[0].getElementsByClassName("container");
  let leftclum = document.getElementsByClassName("leftclum-wrapper")[0].getElementsByClassName("container");
  centerclum[0].insertBefore(selectElement.cloneNode(true), centerclum[0].getElementsByTagName("h1")[0]);
  rightclum[0].insertBefore(selectElement.cloneNode(true), rightclum[0].getElementsByTagName("h1")[0]);
  leftclum[0].insertBefore(selectElement.cloneNode(true), leftclum[0].getElementsByTagName("h1")[0]);

  //ドロップダウンメニューのイベントを登録
  centerclum[0].getElementsByClassName("drop-list")[0].addEventListener('change', function () {
    //選択されたoption番号を取得
    var index = this.selectedIndex;
    SortArticle(centerclum[0].getElementsByClassName("works")[0], GerneList[index]);
  });

  rightclum[0].getElementsByClassName("drop-list")[0].addEventListener('change', function () {
    //選択されたoption番号を取得
    var index = this.selectedIndex;
    SortArticle(rightclum[0].getElementsByClassName("want_read_articles")[0], GerneList[index]);
  });

  leftclum[0].getElementsByClassName("drop-list")[0].addEventListener('change', function () {
    //選択されたoption番号を取得
    var index = this.selectedIndex;
    SortArticle(leftclum[0].getElementsByClassName("delete_articles")[0], GerneList[index]);
  });
}


/*
// ドロップボックスを操作した時のイベント
// 記事をソートする
// parentElement:親要素を特定（rightclum or centerclum or leftclumのどれか）
// selectedOptionName:string型、記事のジャンル名を指定する
*/
function SortArticle(parentElement, selectedOptionName) {
  console.log(selectedOptionName);
  if (selectedOptionName == "すべて") {
    let allElement = parentElement.children;
    for (let i = 0; i < allElement.length; i++) {
      allElement[i].classList.add("now-sort-selected");
    }
  } else {
    let nowsortselectedElement = parentElement.getElementsByClassName("now-sort-selected");
    let selectedElement = parentElement.getElementsByClassName(selectedOptionName);

    //クラス名の初期化
    let nowsortlen = nowsortselectedElement.length;
    for (let i = 0; i < nowsortlen; i++) {
      nowsortselectedElement[0].classList.remove('now-sort-selected');
    }

    //選択したジャンルの要素にクラス名を追加
    for (let i = 0; i < selectedElement.length; i++) {
      selectedElement[i].classList.add("now-sort-selected");
    }
  }
}


/*
//指定したコラムに各ジャンルの記事カウンターを作成する
//clumElementName: カウンターを作成するタブを指定
//gerneCount: ジャンルの数を管理している配列を渡す
*/
function CreatGerneCounter(clumElementName, gerneCount) {
  let clumElement = document.getElementsByClassName(clumElementName)[0];
  if (clumElement.getElementsByClassName("gerne-counter").length != 0) {
    return;
  }

  let GerneCounterULElement;
  GerneCounterULElement = document.createElement("ul");
  GerneCounterULElement.className = "gerne-counter";

  for (let i = 1; i < GerneList.length; i++) {
    let liElement = document.createElement("li");
    liElement.className = "list_" + GerneList[i];
    liElement.innerHTML = GerneList[i] + ":" + gerneCount[GerneList[i]];
    GerneCounterULElement.appendChild(liElement);
  }

  clumElement.getElementsByClassName("container")[0].insertBefore(GerneCounterULElement, clumElement.getElementsByClassName("container")[0].firstChild);
}


/*
//ジャンルの数（変動）を反映させ表示する
//beforeClum:移動前のコラム（right or center or left）
//afterClum:移動先のコラム（right or center or left）
//gerne:移動したコラムのジャンル名
*/
function CountGerne(beforeClum, afterClum, gerne) {
  let beforeliElement = document.getElementsByClassName(beforeClum)[0].getElementsByClassName("list_" + gerne);
  let afterliElement = document.getElementsByClassName(afterClum)[0].getElementsByClassName("list_" + gerne);
  console.log(gerne);
  console.log(mainGerneCounter[gerne]);
  switch (beforeClum) {
    case "":
      mainGerneCounter[gerne] += 1;
      afterliElement[0].innerHTML = gerne + ":" + mainGerneCounter[gerne];
      break;

    case "centerclum-wrapper":
      switch (afterClum) {
        case "rightclum-wrapper":
          mainGerneCounter[gerne] -= 1;
          readGerneCounter[gerne] += 1;
          beforeliElement[0].innerHTML = gerne + ":" + mainGerneCounter[gerne];
          afterliElement[0].innerHTML = gerne + ":" + readGerneCounter[gerne];
          break;

        case "leftclum-wrapper":
          mainGerneCounter[gerne] -= 1;
          noreadGerneCounter[gerne] += 1;
          beforeliElement[0].innerHTML = gerne + ":" + mainGerneCounter[gerne];
          afterliElement[0].innerHTML = gerne + ":" + noreadGerneCounter[gerne];
          break;
      }
      break;

    case "rightclum-wrapper":
      readGerneCounter[gerne] -= 1;
      mainGerneCounter[gerne] += 1;
      beforeliElement[0].innerHTML = gerne + ":" + readGerneCounter[gerne];
      afterliElement[0].innerHTML = gerne + ":" + mainGerneCounter[gerne];
      break;

    case "leftclum-wrapper":
      noreadGerneCounter[gerne] -= 1;
      mainGerneCounter[gerne] += 1;
      beforeliElement[0].innerHTML = gerne + ":" + noreadGerneCounter[gerne];
      afterliElement[0].innerHTML = gerne + ":" + mainGerneCounter[gerne];
      break;
  }
}


/*
//「読む」をクリックした場合対象とする記事を読みたい記事として扱う
*/
function ClickMainClum(obj) {
  console.log("mainClumeで" + obj.id + "番の記事をリスト化する");

  /*要素の取得*/
  let workBlockElement = document.getElementById(obj.id);

  workBlockElement.classList.remove("stu0");
  workBlockElement.classList.add("stu2");
  WriteFile("read", obj.id); //データベースに記事を登録する
  LogWriteFile(obj.id + ":読みたい記事リストへ登録");
  CreateClum(workBlockElement, obj.id, "read"); //右コラムを作成する



  //半透明化する場合は以下の処理を行う（*stu1=読みたい記事として既に選択している場合）
  // if (workBlockElement.className == "work-block stu1") {
  //   workBlockElement.className = "work-block stu0";
  //   ReWriteFile("read", obj.id); //データベースからも記事を削除する
  //   LogWriteFile(obj.id + ":読みたい記事リストから削除");

  //   //右コラムの要素を削除する
  //   document.getElementById("want_read_article_" + obj.id).remove();
  // } else {
  //   workBlockElement.className = "work-block stu1";
  //   WriteFile("read", obj.id); //データベースに記事を登録する
  //   LogWriteFile(obj.id + ":読みたい記事リストへ登録");
  //   CreateClum(workBlockElement, obj.id, "read"); //右コラムを作成する
  // }
}

/*
// 「読まない」を選択した時の処理
// クリックした記事を読みたくない記事として登録する
//　deleteボタンを押す機能に近い
*/
function DeleteArticle(obj) {
  console.log(
    "mainClumeで" + obj.id + "番の記事を読みたくない記事として登録する"
  );

  /*要素の取得*/
  let workBlockElement = document.getElementById(obj.id);

  workBlockElement.classList.remove("stu0");
  workBlockElement.classList.add("stu2");
  WriteFile("noread", obj.id); //データベースに記事を登録する
  CreateClum(workBlockElement, obj.id, "delete"); //左コラムを作成する
  LogWriteFile(obj.id + ":読みたくない記事リストへ登録");

  //以下は半透明化を行う場合の処理（*記事を選択していない場合のみ処理を完了させる）
  // if (workBlockElement.className == "work-block stu0") {
  //   workBlockElement.className = "work-block stu2";
  //   WriteFile("noread", obj.id); //データベースに記事を登録する
  //   CreateClum(workBlockElement, obj.id, "delete"); //左コラムを作成する
  //   LogWriteFile(obj.id + ":読みたくない記事リストへ登録");
  // }
}

/*
//データの書き込み処理
//読みたい記事情報の登録
//読みたいくない記事情報の登録
//引数1 article_abs:読みたいと読みたくないの記事の区別(文字列で　read or noread を指定する)
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
}

/*
// 読了ボタンを押したときの処理
// 選択した記事を中央コラムから削除し、ファイルの書き換えを行う
*/
function WriteAllToNoReadFile() {
  LogWriteFile("選択記事の削除");
  if (document.getElementsByClassName("want_read_article").length == 0) {
    console.log("対象の記事が存在しません");
    return;
  }

  let xmlHttpReq = new XMLHttpRequest();
  let cmd = "./rb/index.rb?cmd=transAll";
  xmlHttpReq.open("GET", cmd, true);
  xmlHttpReq.send(null); //サーバーへのリクエストを送信する、引数はPOSTのときのみ利用

  xmlHttpReq.onreadystatechange = function () {
    if (xmlHttpReq.readyState == 4 && xmlHttpReq.status == 200) {
      let list = xmlHttpReq.responseText.split(/\n/);
      for (let i = 0; i < list.length; i++) {
        console.log(list[i]);
        if (list[i] == "") {
          console.log("リストへの反映が終了");
          break;
        }
        let workBlockElement = document.getElementById(list[i]);
        //workBlockElement.className = "work-block stu2"; //stu0：未選択状態（デフォルト）, stu1：選択状態（半透明化）, stu2：コラムから除外した状態（非表示）
        CreateClum(workBlockElement, list[i], "delete");

        //要素を探索し削除
        CountGerne("rightclum-wrapper", "leftclum-wrapper", document.getElementById("want_read_article_" + list[i]).getElementsByTagName("h4")[0].innerHTML.replace("#", ""));
        document.getElementById("want_read_article_" + list[i]).remove();
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
  } else if (select == "read") {
    parentElementName = "want_read_articles";
    classElementName = "want_read_article";
    ElementStatus = "read";
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
        CountGerne(targetClumName + "-wrapper", "centerclum-wrapper", workBlockElement.getElementsByTagName("h4")[0].innerHTML.replace("#", ""));
        ReWriteFile(ElementStatus, id);
        workBlockElement.classList.remove("stu2");
        workBlockElement.classList.add("stu0");
        ArticleElement.remove();
      }
    },
    false
  );

  //h3要素（見出し）の作成
  let h3Element = document.createElement("h3");
  h3Element.innerHTML = workBlockElement.getElementsByTagName(
    "h3"
  )[0].innerHTML;

  //h4要素（ジャンル）の作成
  let h4Element = document.createElement("h4");
  h4Element.innerHTML = workBlockElement.getElementsByTagName(
    "h4"
  )[0].innerHTML;
  ArticleElement.classList.add(h4Element.innerHTML.replace("#", ""));
  CountGerne("centerclum-wrapper", targetClumName + "-wrapper", h4Element.innerHTML.replace("#", ""));

  //p要素（スニペッド）の作成
  let pElement = document.createElement("p");
  pElement.innerHTML = workBlockElement.getElementsByTagName(
    "p"
  )[0].innerHTML;

  ArticleElement.appendChild(h3Element);
  ArticleElement.appendChild(h4Element);
  ArticleElement.appendChild(pElement);
  ArticlesElement[0].appendChild(ArticleElement);
}

/*
//ブラウザを更新したときの処理
//指定したファイルからデータを読み込みmainclum（とreadページ）を編集する
//読みたいリスト、（と読みたくないリスト）からデータを取得して画面状態を生成する
*/
function ReadListFile(article_abs) {
  console.log(article_abs + "にアクセス");
  var xmlHttpReq = new XMLHttpRequest();
  var cmd = "./rb/index.rb?cmd=read";
  var fileName = "&fn=list/" + article_abs + "ArticleList.txt";

  xmlHttpReq.open("GET", cmd + fileName, true); //ここで指定するパスは、index.htmlファイルを基準にしたときの相対パス
  xmlHttpReq.send(null); //サーバーへのリクエストを送信する、引数はPOSTのときのみ利用

  xmlHttpReq.onreadystatechange = function () {
    if (xmlHttpReq.readyState == 4 && xmlHttpReq.status == 200) {
      list = xmlHttpReq.responseText.split(/\n/);
      for (let i = 0; i < list.length - 1; i++) {
        if (list[i] == "") {
          console.log("リストへの反映が終了");
          break;
        }
        console.log(list[i] + "番目の記事を読みたいリストに読み込む");
        let workBlockElement = document.getElementById(list[i]);
        if (article_abs == "read") {
          workBlockElement.classList.remove("stu0");
          workBlockElement.classList.add("stu2");
          CreateClum(workBlockElement, list[i], "read"); //右コラムを作成する
        } else if (article_abs == "noread") {
          workBlockElement.classList.remove("stu0");
          workBlockElement.classList.add("stu2");
          CreateClum(workBlockElement, list[i], "delete");
        }
      }
    }
  };
}