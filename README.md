spike
=====

### adds w3c methods in Internet Explorer

������ ���������� ������������� ������ ��� Internet Explorer 6,7,8 � � ���������� �������� ����� ���-�� ��������� � � IE9.

����� �����, ��������� IE6 � �� ����������, �� ���������� ������� � ���� ��� ��� ����� ���� ������ �������� � IE6, ��� ��� �� �� ����������.

��� ������ ������ ��� ����������, � ������ ��� ����� ������� ����. ��������� W3C-���� ������ � �����������, ����� ��� `addEventListener`, `querySelector` � �.�.

������ ����������, � ������ ������ ��������� � ��� ������������� ����� �����������. ��-���� ���������� �� ������ ��������� ��������������. �� ���� ���� ����.

#### DOM Element.prototype:

� IE7 � ���� ��� ����������� ��������� �������� ������ �����������, ������� �� ����� ������������ ���� ���������, ��� ����� � ������� ��������� ������ ��� �� �������� � IE<8. ������ ��� ���� ����������� ��� ��������� �������� ������ ��������.

��� ���� ���� �� �������� ����� ��������� �������� � IE 7-�� ������ � ����:
```js
var div = document.createElement( 'div' );
Element.prototype.ourNewMethod = function() {
    alert( '������ ���!' )
}
div.ourNewMethod(); // alerts '������ ���!'
```
� ������ �������� ������� ��� ������ � ������.

#### ������ ������� ��������� ������ ����������:

`.addEventListener`
- ������ ��������� �������, ������� ����������� ������ ������� �� ����� ����������, ��-���� ������ �������� ������ �� ������������.

`.removeEventListener`
- ������ ��������� �������� �������, ��� �� ������� � ����������� �� ���� ���� ���������������.

`.dispatchEvent`
- ������ ��������� ������� ������� �������.

`document.createEvent`
- ��������� ��������� �������� �������, ������������ ������� ������ DOM Level 2, ��-���� `Event`, `CustomEvent`, `UIEvent`, `MouseEvent`. � ���������� �������� ����� ���������.

#### ������ ��������� ���������� �������, ������������ ����� ������ ���:

`.preventDefault()`
- �������� �������� �� ���������.

`.stopPropagation()`
- �������� ������� �� ��������� ���� ��� ������ ��������.

`.stopImmediatePropagation()`
- ������ ��������� ��������������� �������. (����� � HTML5)

� ������ �������� ���������� ������� �� ����������� DOM Level 2

��� �� ������������ ��������� ����������� ��� ����:
```js
Event.CAPTURING_PHASE
Event.AT_TARGET
Event.BUBBLING_PHASE
```

#### ���������:

`.querySelectorAll`
- ������ CSS3 �������� ��� ������ ������ ���������, � IE8 ��������� ��������� ������ ��� ���������� ������� �� ����� �������� �����.

`.querySelector`
- ������ CSS3 �������� ��� ������ ������ ��������

`.getElementsByClassName`
- ������ ��������� ������ �� ������ ��������, ��� �� ����� ��������� ������ ������� ������� ����������� ������ ����� �������������� � ������� ��������

`.matchesSelector`
- ������ CSS3 �������� ��� �������� ��������

��� ��� �� ������ ������ �������� � IE 6,7,8. ������� ������ �� ��������, �� �� ����� ���������� ����� ���� ������������� ���������. ���� ����� ������� ���������, ��� ������� ������, ��������� ��� � � �� ��� ���������� ���������.
