import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  CheckIcon,
  StarIcon,
  SparklesIcon,
  ArrowRightIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ClockIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const PlansPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      id: 'free',
      name: t('plans.free'),
      description: t('plans.freeDescription'),
      price: { monthly: 0, yearly: 0 },
      features: [
        { text: t('plans.freeFeatures.posts'), included: true, limit: '5' },
        { text: t('plans.freeFeatures.listingTime'), included: true, limit: '7 days' },
        { text: t('plans.freeFeatures.basicSupport'), included: true },
        { text: t('plans.freeFeatures.standardVisibility'), included: true },
        { text: t('plans.freeFeatures.analytics'), included: false },
        { text: t('plans.freeFeatures.prioritySupport'), included: false },
        { text: t('plans.freeFeatures.premiumBadge'), included: false },
        { text: t('plans.freeFeatures.advancedFeatures'), included: false }
      ],
      popular: false,
      icon: StarIcon
    },
    {
      id: 'premium',
      name: t('plans.premium'),
      description: t('plans.premiumDescription'),
      price: { monthly: 29, yearly: 290 },
      features: [
        { text: t('plans.premiumFeatures.posts'), included: true, limit: 'Unlimited' },
        { text: t('plans.premiumFeatures.listingTime'), included: true, limit: '30 days' },
        { text: t('plans.premiumFeatures.prioritySupport'), included: true },
        { text: t('plans.premiumFeatures.enhancedVisibility'), included: true },
        { text: t('plans.premiumFeatures.analytics'), included: true },
        { text: t('plans.premiumFeatures.premiumBadge'), included: true },
        { text: t('plans.premiumFeatures.advancedFeatures'), included: true },
        { text: t('plans.premiumFeatures.customBranding'), included: true }
      ],
      popular: true,
      icon: SparklesIcon
    }
  ];

  const currentPlan = plans.find(plan => plan.id === user?.plan) || plans[0];
  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);

  const handleUpgrade = () => {
    // Handle plan upgrade logic
    console.log('Upgrading to:', selectedPlan, 'Billing:', billingCycle);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('plans.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('plans.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Current Plan Status */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gold-100 rounded-full p-3">
                    <currentPlan.icon className="w-6 h-6 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('plans.currentPlan')}: {currentPlan.name}
                    </h3>
                    <p className="text-gray-600">{currentPlan.description}</p>
                  </div>
                </div>
                {currentPlan.id === 'free' && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{t('plans.upgradeToGetMore')}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-200">
            <div className="flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-gold-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('plans.monthly')}
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-gold-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('plans.yearly')}
                <span className="ml-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {t('plans.save20')}
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all hover:shadow-lg ${
                plan.popular 
                  ? 'border-gold-500 shadow-gold-100' 
                  : 'border-gray-200'
              } ${selectedPlan === plan.id ? 'ring-2 ring-gold-500 ring-opacity-50' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gold-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    {t('plans.mostPopular')}
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-100 rounded-full mb-4">
                    <plan.icon className="w-8 h-8 text-gold-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price[billingCycle]}
                    </span>
                    {plan.price[billingCycle] > 0 && (
                      <span className="text-gray-500 ml-2">
                        /{billingCycle === 'monthly' ? t('plans.month') : t('plans.year')}
                      </span>
                    )}
                  </div>
                  {plan.price[billingCycle] === 0 && (
                    <p className="text-gray-500 mt-2">{t('plans.foreverFree')}</p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        feature.included ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {feature.included ? (
                          <CheckIcon className="w-3 h-3 text-green-600" />
                        ) : (
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm ${
                          feature.included ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {feature.text}
                        </span>
                        {feature.limit && (
                          <span className="text-xs text-gold-600 font-medium ml-1">
                            ({feature.limit})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-3 px-6 rounded-xl font-medium transition-all ${
                    selectedPlan === plan.id
                      ? 'bg-gold-500 text-white shadow-lg hover:bg-gold-600'
                      : plan.popular
                      ? 'bg-gold-50 text-gold-700 border-2 border-gold-200 hover:bg-gold-100'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {selectedPlan === plan.id ? (
                    <span className="flex items-center justify-center">
                      <CheckIcon className="w-4 h-4 mr-2" />
                      {t('plans.selected')}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      {t('plans.select')}
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Upgrade Section */}
        {selectedPlan !== currentPlan.id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('plans.upgradeTo')} {selectedPlanData.name}
              </h3>
              <p className="text-gray-600">
                {t('plans.upgradeDescription')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <SparklesIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{t('plans.instantUpgrade')}</h4>
                <p className="text-sm text-gray-600">{t('plans.instantUpgradeDesc')}</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{t('plans.securePayment')}</h4>
                <p className="text-sm text-gray-600">{t('plans.securePaymentDesc')}</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <ClockIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{t('plans.cancelAnytime')}</h4>
                <p className="text-sm text-gray-600">{t('plans.cancelAnytimeDesc')}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleUpgrade}
                className="btn-primary flex items-center"
              >
                <CreditCardIcon className="w-4 h-4 mr-2" />
                {t('plans.upgradeNow')} - ${selectedPlanData.price[billingCycle]}
                {billingCycle === 'monthly' ? `/${t('plans.month')}` : `/${t('plans.year')}`}
              </button>
              <p className="text-sm text-gray-500">
                {t('plans.billed')} {billingCycle === 'monthly' ? t('plans.monthly') : t('plans.yearly')}
              </p>
            </div>
          </motion.div>
        )}

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            {t('plans.faqTitle')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('plans.faq1.question')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('plans.faq1.answer')}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('plans.faq2.question')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('plans.faq2.answer')}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('plans.faq3.question')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('plans.faq3.answer')}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('plans.faq4.question')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('plans.faq4.answer')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlansPage;
