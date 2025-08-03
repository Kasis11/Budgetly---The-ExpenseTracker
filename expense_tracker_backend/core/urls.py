from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WalletViewSet, ExpenseViewSet, BudgetViewSet, RegisterView

router = DefaultRouter()
router.register(r'wallet', WalletViewSet, basename='wallet')
router.register(r'expenses', ExpenseViewSet, basename='expenses')
router.register(r'budget', BudgetViewSet, basename='budget')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),

]
