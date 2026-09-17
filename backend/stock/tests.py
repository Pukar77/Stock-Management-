from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


@override_settings(ALLOWED_HOSTS=['*'])
class StockUserIsolationTests(TestCase):

    def setUp(self):
        self.user_a = User.objects.create_user(
            username='alpha', password='pass1234', phone_number='1111111111', email='a@test.com'
        )
        self.user_b = User.objects.create_user(
            username='beta', password='pass1234', phone_number='2222222222', email='b@test.com'
        )
        self.client_a = self._client(self.user_a)
        self.client_b = self._client(self.user_b)

    def _client(self, user):
        client = APIClient(enforce_csrf_checks=False)
        client.credentials(
            HTTP_AUTHORIZATION='Bearer ' + str(RefreshToken.for_user(user).access_token)
        )
        return client

    def _create_product(self, client, name, hsn):
        return client.post(
            '/api/stock/potential-stock/',
            {'product_name': name, 'hsn_code': hsn},
            format='json',
        )

    def test_each_user_only_sees_own_records(self):
        self._create_product(self.client_a, 'Product A', 1001)
        self._create_product(self.client_b, 'Product B', 2002)

        a_products = self.client_a.get('/api/stock/potential-stock/').data
        b_products = self.client_b.get('/api/stock/potential-stock/').data

        self.assertEqual(
            [p['product_name'] for p in a_products], ['Product A']
        )
        self.assertEqual(
            [p['product_name'] for p in b_products], ['Product B']
        )
        self.assertEqual(len(self.client_a.get('/api/stock/stock-in/').data), 0)
        self.assertEqual(len(self.client_b.get('/api/stock/stock-in/').data), 0)

    def test_stock_in_and_total_stock_are_scoped_to_user(self):
        self._create_product(self.client_b, 'Product B', 2002)
        res = self.client_b.post(
            '/api/stock/stock-in/',
            {'product_name': 'Product B', 'hsn_code': 2002, 'quantity': 50, 'purchase_price': 100},
            format='json',
        )
        self.assertEqual(res.status_code, 201)

        b_total = self.client_b.get('/api/stock/total-stock/').data
        a_total = self.client_a.get('/api/stock/total-stock/').data
        self.assertEqual(b_total[0]['current_stock'], 50)
        self.assertEqual(a_total, [])
        self.assertEqual(len(self.client_a.get('/api/stock/stock-in/').data), 0)

    def test_cannot_reference_another_users_product(self):
        self._create_product(self.client_a, 'Product A', 1001)
        res = self.client_b.post(
            '/api/stock/stock-in/',
            {'product_name': 'Product A', 'hsn_code': 1001, 'quantity': 5, 'purchase_price': 10},
            format='json',
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn('No product found', str(res.data))

    def test_unauthorized_request_is_rejected(self):
        client = APIClient(enforce_csrf_checks=False)
        res = client.get('/api/stock/potential-stock/')
        self.assertEqual(res.status_code, 401)