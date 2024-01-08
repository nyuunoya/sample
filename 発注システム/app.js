// app.js

// CSSファイルを読み込む
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'styles.css'; //暫定的に同階層に配置
document.head.appendChild(link);

new Vue({
    el: '#app',

    data: {
      account: '田中',
      //商品のリスト  
      productList: [
          { id: 1,code: '1234567890123456', category: '食品', name: 'コーラ', price: 150,  orderQuantity: 0 , orderAmount: 0 ,abnormalValue: 99},
          { id: 2,code: '2345678901234567', category: '食品', name: 'ポテトチップス', price: 450,  orderQuantity: 0 , orderAmount: 0 ,abnormalValue: 99},
          { id: 3,code: '3456789012345678', category: '家電', name: 'パソコン', price: 200000,  orderQuantity: 0 , orderAmount: 0 ,abnormalValue: 5},
      ],
      
      //合計
      totalAmount: 0,
      //消費税率
      taxRate: {
        food: 0.08, // 食料品の消費税率
        other: 0.1   // その他の消費税率
      },
      //注文履歴
      orderHistory: [],
      //注文明細
      orderDetail: [],
      orderIdCounter:0,
    },

    computed: {
      foodSubtotal() {
        return this.productList.filter(item => item.category === '食品').reduce((total, product) => total + (product.price * product.orderQuantity), 0);
      },

      otherSubtotal(){
        return this.productList.filter(item => item.category !== '食品').reduce((total, product) => total + (product.price * product.orderQuantity), 0);
      },
      subtotal(){
        return this.foodSubtotal+this.otherSubtotal
      },

      tax(){
        return this.foodSubtotal*this.taxRate.food+this.otherSubtotal*this.taxRate.other
      },

    },
    methods: {
      calculateOrderAmount(product, index) {
        //発注数の異常値検知
        if (product.orderQuantity < 0) {
          product.orderQuantity = 0;
        }
        if (product.orderQuantity > product.abnormalValue) {
          product.orderQuantity = product.abnormalValue;
        }

        this.productList[index].orderAmount = product.price * product.orderQuantity;
      },

      placeOrder() {
        // 合計発注金額が0の場合は警告メッセージを表示して処理を中断
        if (this.subtotal === 0) {
          window.alert('合計金額が￥0です。いずれかの商品を発注してください。');
          return;
        }
        // 最終確認
        if (window.confirm('本当に発注しますか？')) {
          this.orderIdCounter++;
          // 発注データを発注履歴に追加
          this.orderHistory.unshift({
            id: this.orderIdCounter, // 一意のIDを割り振り
            timestamp: new Date().toLocaleString(),
            account: this.account,
          });
          // 発注データを発注明細に追加
          const orderDetails = this.productList
          .filter(product => product.orderQuantity > 0)
          .map(product => ({
            orderId: this.orderIdCounter,
            code: product.code,
            productName: product.name,
            quantity: product.orderQuantity,
            amount: product.orderAmount,
          }));
    
        this.orderDetail.unshift(...orderDetails);
            
          
          

          window.alert("発注しました。");
          // ここに実際の発注処理を追加する

        } 
        else {
          // キャンセルされた場合の処理
          window.alert('発注をキャンセルしました');
        }
      },

      openOrderDetailsWindow(orderId) {
        // orderIdに対応するorderDetailsを取得
        const orderDetails = this.orderDetail.filter(detail => detail.orderId === orderId);
    
        // 新しいウィンドウを開く
        const orderDetailsWindow = window.open('', '_blank', 'width=1000,height=400');
        // CSSファイルを読み込む
        const link = orderDetailsWindow.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'styles.css'; //暫定的に同階層に配置
        orderDetailsWindow.document.head.appendChild(link);
        
        // orderDetailsを表示するためのHTMLを構築
        const orderDetailsHtml = `
        <h2>注文明細</h2>
        <table>
          <thead>
            <tr>
              <th>商品コード</th>
              <th>商品名</th>
              <th>数量</th>
              <th>金額</th>
            </tr>
          </thead>
          <tbody>
            ${orderDetails.map(detail => `
              <tr>
                <td>${detail.code}</td>
                <td>${detail.productName}</td>
                <td>${detail.quantity}</td>
                <td>￥${detail.amount.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    
        // 新しいウィンドウにHTMLを挿入
        orderDetailsWindow.document.body.innerHTML = orderDetailsHtml;
      }
    }
  });
